using AIQuizApp.Data;
using AIQuizApp.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Http;
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
        public async Task<ActionResult<List<Quiz>>> GetAll([FromQuery] string? search, [FromQuery] Guid? organizationId, [FromQuery] int? limit, [FromQuery] bool? saved)
        {
            IQueryable<Quiz> quizzesQuery = dbcontext.Quizzes.AsQueryable();
            if(organizationId is not null)
            {
                try
                {
                    var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
                }
                catch (FormatException)
                {
                    return Unauthorized();
                }
                quizzesQuery = quizzesQuery.Where(q => q.OrganizationId == organizationId);
            }
            if (saved is not null)
            {
                Guid userId;
                try
                {
                    userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
                }
                catch (FormatException)
                {
                    return Unauthorized();
                }

                if (saved is true)
                {
                    quizzesQuery = quizzesQuery
                        .Where(q => dbcontext.SavedQuizzes
                            .Any(sq => sq.QuizId == q.Id && sq.UserId == userId));
                }
                else
                {
                    quizzesQuery = quizzesQuery
                        .Where(q => !dbcontext.SavedQuizzes
                            .Any(sq => sq.QuizId == q.Id && sq.UserId == userId));
                }
            }
            if (!(string.IsNullOrEmpty(search)))
            {
                quizzesQuery = quizzesQuery.Where(q => q.Title.Contains(search));
            }
            if (limit is not null)
            {
                quizzesQuery = quizzesQuery.Take(limit ?? 0);
            }
            List<Quiz> quizzes = await quizzesQuery.ToListAsync();
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
            catch (FormatException)
            {
                return Unauthorized();
            }
            Quiz? quiz = await dbcontext.Quizzes.FindAsync(id);
            if(quiz is null)
            {
                return NotFound();
            }
            if(quiz.OrganizationId is not null)
            {
                Membership? membership = await dbcontext.Memberships.Where(m => m.OrganizationId == quiz.OrganizationId && m.UserId == userId).FirstOrDefaultAsync();
                if(membership is null)
                {
                    return NotFound();
                }
            }
            return Ok(quiz);
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
            };
            if(quizDTO.OrganizationId is not null)
            {
                Organization? organization = await dbcontext.Organizations.FindAsync(quizDTO.OrganizationId);
                if (organization is null)
                {
                    return BadRequest("Organization does not exist");
                }
                quiz.OrganizationId = quizDTO.OrganizationId;
                quiz.Organization = organization;
            }
            await dbcontext.Quizzes.AddAsync(quiz);
            await dbcontext.SaveChangesAsync();

            return CreatedAtAction(nameof(GetById), new { quiz.Id }, quiz);
        }

        [HttpGet]
        [Authorize]
        [Route("saved/{id:guid}")]
        public async Task<ActionResult<SavedStatusDTO>> GetSavedStatus(Guid id)
        {
            Guid authUserId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            UserSavedQuiz? saved = await dbcontext.SavedQuizzes.Where(s => s.QuizId == id && s.UserId == authUserId).FirstOrDefaultAsync();
            if(saved is null)
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
            if(quiz is null)
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
            List <User> instructors = await dbcontext.Memberships.Where(m => m.OrganizationId == quiz.OrganizationId && m.Role == "Instructor").Select(m => m.User).ToListAsync();
            if ((quiz.OrganizationId is null && quiz.AuthorId == authUserId)
                || (quiz.OrganizationId is not null && instructors.Contains(user))){
                dbcontext.Quizzes.Remove(quiz);
                await dbcontext.SaveChangesAsync();
            }
            return NoContent();
        }
    }
}
