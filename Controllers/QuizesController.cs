using AIQuizApp.Data;
using AIQuizApp.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using RouteAttribute = Microsoft.AspNetCore.Mvc.RouteAttribute;

namespace AIQuizApp.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class QuizesController : ControllerBase
    {
        private readonly AppDbContext dbcontext;
        public QuizesController(AppDbContext _dbcontext)
        {
            dbcontext = _dbcontext;
        }
        [HttpGet]
        public async Task<ActionResult<List<QuizInfoDTO>>> GetAll(
            [FromQuery] string? search,
            [FromQuery] Guid? organizationId,
            [FromQuery] int? limit,
            [FromQuery] bool? saved,
            [FromQuery] bool? my,
            [FromQuery] bool? taken)
        {
            IQueryable<Quiz> quizzesQuery = dbcontext.Quizzes
                .Include(q => q.Author)
                .AsQueryable();

            bool hasAnyFilter =
                !string.IsNullOrEmpty(search) ||
                organizationId != null ||
                saved != null ||
                my != null ||
                taken != null;

            Guid? userId = null;

            // Only require user when doing user-specific queries
            if (saved != null || my != null || taken != null || organizationId != null)
            {
                var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);

                if (!Guid.TryParse(userIdClaim, out var parsedUserId))
                    return Unauthorized();

                userId = parsedUserId;
            }

            if (!hasAnyFilter)
            {
                quizzesQuery = quizzesQuery.Where(q => q.OrganizationId == null);
            }

            // Organization filter
            if (organizationId is not null)
            {
                var isMember = await dbcontext.Memberships
                    .AnyAsync(m => m.OrganizationId == organizationId && m.UserId == userId);

                if (!isMember)
                    return Forbid();

                quizzesQuery = quizzesQuery.Where(q => q.OrganizationId == organizationId);
            }
            else if (saved != null || my != null || taken != null)
            {
                // user filters without org → only public quizzes
                quizzesQuery = quizzesQuery.Where(q => q.OrganizationId == null);
            }

            // Saved filter
            if (saved is not null && userId != null)
            {
                if (saved == true)
                {
                    quizzesQuery = quizzesQuery.Where(q =>
                        dbcontext.SavedQuizzes.Any(sq => sq.QuizId == q.Id && sq.UserId == userId));
                }
                else
                {
                    quizzesQuery = quizzesQuery.Where(q =>
                        !dbcontext.SavedQuizzes.Any(sq => sq.QuizId == q.Id && sq.UserId == userId));
                }
            }

            // My quizzes
            if (my == true && userId != null)
            {
                quizzesQuery = quizzesQuery.Where(q => q.AuthorId == userId);
            }

            // Taken filter
            if (taken is not null && userId != null)
            {
                if (taken == true)
                {
                    quizzesQuery = quizzesQuery.Where(q =>
                        dbcontext.TakenQuizzes.Any(tq => tq.QuizId == q.Id && tq.UserId == userId));
                }
                else
                {
                    quizzesQuery = quizzesQuery.Where(q =>
                        !dbcontext.TakenQuizzes.Any(tq => tq.QuizId == q.Id && tq.UserId == userId));
                }
            }

            // Search
            if (!string.IsNullOrEmpty(search))
            {
                quizzesQuery = quizzesQuery.Where(q => q.Title.Contains(search));
            }

            // Limit
            if (limit is not null)
            {
                quizzesQuery = quizzesQuery.Take(limit.Value);
            }

            var quizzes = await quizzesQuery
                .Select(q => new QuizInfoDTO
                {
                    Id = q.Id,
                    Title = q.Title,
                    AuthorName = q.Author.Name,
                    AuthorId = q.Author.Id,
                    CreatedAt = q.CreatedAt
                })
                .ToListAsync();

            return Ok(quizzes);
        }

        [HttpGet]
        [Route("{id:guid}")]
        public async Task<ActionResult<Quiz>> GetById(Guid id)
        {
            Guid userId;
            try
            {
                userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
            }
            catch (Exception)
            {
                return Unauthorized();
            }
            Quiz? quiz = await dbcontext.Quizzes.FindAsync(id);
            if (quiz is null)
            {
                return NotFound();
            }
            if (quiz.OrganizationId is not null)
            {
                Membership? membership = await dbcontext.Memberships.Where(m => m.OrganizationId == quiz.OrganizationId && m.UserId == userId).FirstOrDefaultAsync();
                if (membership is null)
                {
                    return NotFound();
                }
            }
            return Ok(quiz);
        }

        [HttpGet]
        [Authorize]
        [Route("attempts/{quizId:guid}")]
        public async Task<ActionResult<List<SubmitQuizDTO>>> GetAttempts(Guid quizId)
        {
            Guid authUserId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            List<SubmitQuizDTO> response = await dbcontext.TakenQuizzes
                .Where(t => t.QuizId == quizId && t.UserId == authUserId)
                .Select(t => new SubmitQuizDTO()
                {
                    QuizId = quizId,
                    Score = t.Score
                }).ToListAsync();
            return Ok(response);
        }

        [HttpPost]
        [Authorize]
        public async Task<ActionResult<Quiz>> Create([FromBody] QuizDTO quizDTO)
        {
            Guid authUserId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            User user = (await dbcontext.Users.FindAsync(authUserId))!;
            Quiz quiz = new()
            {
                Title = quizDTO.Title,
                Answers = quizDTO.Answers,
                Questions = quizDTO.Questions,
                AuthorId = authUserId,
                Author = user,
                CorrectAnswerIndices = quizDTO.CorrectAnswerIndices,
                CreatedAt = DateTime.UtcNow,
            };
            if (quizDTO.OrganizationId is not null)
            {
                Organization? organization = await dbcontext.Organizations.FindAsync(quizDTO.OrganizationId);
                if (organization is null)
                {
                    return BadRequest("Organization does not exist");
                }
                Membership? membership = await dbcontext.Memberships.FirstOrDefaultAsync(m => m.UserId == authUserId && m.OrganizationId == quizDTO.OrganizationId);
                if (membership is null || membership.Role != "Instructor")
                {
                    return Forbid();
                }
                quiz.OrganizationId = quizDTO.OrganizationId;
                quiz.Organization = organization;
            }
            await dbcontext.Quizzes.AddAsync(quiz);
            await dbcontext.SaveChangesAsync();

            return CreatedAtAction(nameof(GetById), new { quiz.Id }, quiz);
        }

        [HttpPost]
        [Authorize]
        [Route("submit")]
        public async Task<IActionResult> SubmitQuiz(SubmitQuizDTO quizDTO)
        {
            Guid authUserId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            User user = (await dbcontext.Users.FindAsync(authUserId))!;
            UserTakesQuiz submission = new()
            {
                User = user,
                UserId = authUserId,
                QuizId = quizDTO.QuizId,
                Score = quizDTO.Score
            };
            await dbcontext.TakenQuizzes.AddAsync(submission);
            await dbcontext.SaveChangesAsync();
            return NoContent();
        }
        [HttpGet]
        [Authorize]
        [Route("saved/{id:guid}")]
        public async Task<ActionResult<SavedStatusDTO>> GetSavedStatus(Guid id)
        {
            Guid authUserId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            UserSavedQuiz? saved = await dbcontext.SavedQuizzes.Where(s => s.QuizId == id && s.UserId == authUserId).FirstOrDefaultAsync();
            if (saved is null)
            {
                return Ok(new SavedStatusDTO { Saved = false });
            } else
            {
                return Ok(new SavedStatusDTO { Saved = true });
            }

        }


        [HttpPost]
        [Authorize]
        [Route("save/{id:guid}")]
        public async Task<IActionResult> Save(Guid id)
        {
            Quiz? quiz = await dbcontext.Quizzes.FindAsync(id);
            Guid authUserId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            User user = (await dbcontext.Users.FindAsync(authUserId))!;

            if (quiz is null)
            {
                return NotFound();
            }
            UserSavedQuiz? saved = await dbcontext.SavedQuizzes.Where(s => s.QuizId == id && s.UserId == authUserId).FirstOrDefaultAsync();
            if (saved is not null)
            {
                return BadRequest("Already saved.");
            }
            UserSavedQuiz savedQuiz = new()
            {
                User = user,
                UserId = authUserId,
                QuizId = id,
                Quiz = quiz
            };
            await dbcontext.SavedQuizzes.AddAsync(savedQuiz);
            await dbcontext.SaveChangesAsync();
            return NoContent();

        }

        [HttpPost]
        [Authorize]
        [Route("unsave/{id:guid}")]
        public async Task<IActionResult> Unsave(Guid id)
        {
            Quiz? quiz = await dbcontext.Quizzes.FindAsync(id);
            Guid authUserId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            User user = (await dbcontext.Users.FindAsync(authUserId))!;

            if (quiz is null)
            {
                return NotFound();
            }

            UserSavedQuiz? saved = await dbcontext.SavedQuizzes
                .Where(s => s.QuizId == id && s.UserId == authUserId)
                .FirstOrDefaultAsync();

            if (saved is null)
            {
                return BadRequest("Quiz is not saved.");
            }

            dbcontext.SavedQuizzes.Remove(saved);
            await dbcontext.SaveChangesAsync();

            return NoContent();
        }

        [HttpPatch]
        [Route("{id:guid}")]
        public async Task<ActionResult<Quiz>> Edit(Guid id, [FromBody] QuizDTO quizDTO)
        {
            Quiz? quiz = await dbcontext.Quizzes.FindAsync(id);
            if (quiz is null)
            {
                return NotFound();
            }
            quiz.Title = quizDTO.Title ?? quiz.Title;
            quiz.Questions = quizDTO.Questions ?? quiz.Questions;
            quiz.CorrectAnswerIndices = quizDTO.CorrectAnswerIndices ?? quiz.CorrectAnswerIndices;
            quiz.Answers = quizDTO.Answers ?? quiz.Answers;

            await dbcontext.SaveChangesAsync();
            return Ok(quiz);

        }


        [HttpDelete]
        [Route("{id:guid}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            Quiz? quiz = await dbcontext.Quizzes.FindAsync(id);
            if (quiz is null)
            {
                return NotFound();
            }
            Guid authUserId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            User? user = await dbcontext.Users.FindAsync(authUserId);
            if (user is null)
            {
                return BadRequest("Not a valid user");
            }

            // Valid context 1: quiz not part of any organization and user is owner
            // Valid context 2: quiz is in organization, and user is instructor
            List<User> instructors = await dbcontext.Memberships.Where(m => m.OrganizationId == quiz.OrganizationId && m.Role == "Instructor").Select(m => m.User).ToListAsync();
            if ((quiz.OrganizationId is null && quiz.AuthorId == authUserId)
                || (quiz.OrganizationId is not null && instructors.Contains(user))) {
                dbcontext.Quizzes.Remove(quiz);
                await dbcontext.SaveChangesAsync();
            }
            return NoContent();
        }

        [HttpGet]
        [Authorize]
        [Route("{id:guid}/student-attempts")]
        public async Task<ActionResult<List<QuizScoreDTO>>> GetStudentAttempts(Guid id)
        {
            Quiz? quiz = await dbcontext.Quizzes.FindAsync(id);
            Guid authUserId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

            if (quiz is null)
            {
                return NotFound();
            }

            Membership? membership = await dbcontext.Memberships
                .FirstOrDefaultAsync(m => m.UserId == authUserId && m.OrganizationId == quiz.OrganizationId);

            if (membership is null || membership.Role != "Instructor")
            {
                return Forbid();
            }

            var attempts = await dbcontext.TakenQuizzes
                .Where(tq => tq.QuizId == id)
                .Select(tq => new QuizScoreDTO
                {
                    Email = tq.User.Email,
                    Name = tq.User.Name,
                    UserId = tq.UserId,
                    Score = tq.Score
                })
                .ToListAsync();

            return Ok(attempts);
        }
    }
}
