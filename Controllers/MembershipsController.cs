using AIQuizApp.Data;
using AIQuizApp.Models;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace AIQuizApp.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MembershipsController : Controller
    {
        private readonly AppDbContext dbcontext;
        public MembershipsController(AppDbContext _dbcontext)
        { 
            dbcontext = _dbcontext;
        }

        [HttpGet]
        [Authorize]
        [Route("myrole/{organizationId:guid}")]
        public async Task<ActionResult<MembershipRoleDTO>> MyRole(Guid organizationId)
        {
            Guid userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            Membership? membership = await dbcontext.Memberships.FirstOrDefaultAsync(m =>
            m.UserId == userId && m.OrganizationId == organizationId);
            if (membership is null)
            {
                return BadRequest("Not a member");
            }
            MembershipRoleDTO roleDTO = new() { Role = membership.Role };
            return Ok(roleDTO);
        }

        [HttpGet]
        [Authorize]
        [Route("joinrequests")]
        public async Task<ActionResult<List<JoinRequestInfoDTO>>> GetJoinRequests(
            [FromQuery] Guid? organizationId,
            [FromQuery] Guid? userId)
        {
            IQueryable<JoinRequest> query = dbcontext.JoinRequests;

            if (organizationId.HasValue)
            {
                query = query.Where(j => j.OrganizationId == organizationId.Value);
            }

            if (userId.HasValue)
            {
                query = query.Where(j => j.UserId == userId.Value);
            }

            List<JoinRequestInfoDTO> requests = await query
                .Select(j => new JoinRequestInfoDTO
                {
                    Id = j.Id,
                    Name = j.User.Name,
                    Email = j.User.Email,
                    OrgName = j.Organization.Name
                })
                .ToListAsync();

            return Ok(requests);
        }

        [HttpPost]
        [Route("join")]
        public async Task<ActionResult<JoinRequestInfoDTO>> RequestJoinOrganization([FromBody] JoinRequestDTO joinDTO) 
        {
            Guid userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            User user = (await dbcontext.Users.FindAsync(userId))!;

            Organization? organization = await dbcontext.Organizations.FirstOrDefaultAsync(o => o.JoinCode == joinDTO.JoinCode);
            if (organization is null)
            {
                return BadRequest("Invalid Join Code.");
            }

            bool isAlreadyMember = await dbcontext.Memberships.AnyAsync(m => m.UserId == userId && m.OrganizationId == organization.Id);
            if (isAlreadyMember)
            {
                return BadRequest("Already a Member.");
            }

            bool isPending = await dbcontext.JoinRequests.AnyAsync(j => j.UserId == userId && j.OrganizationId == organization.Id);
            if (isPending)
            {
                return BadRequest("Already requested.");
            }
            JoinRequest joinRequest = new()
            {
                OrganizationId = organization.Id,
                Organization = organization,
                User = user,
                UserId = userId,
            };
            JoinRequestInfoDTO returnDTO = new()
            {
                Id = joinRequest.Id,
                Email = joinRequest.User.Email,
                Name = joinRequest.User.Name,
                OrgName = joinRequest.Organization.Name
            };

            await dbcontext.JoinRequests.AddAsync(joinRequest);
            await dbcontext.SaveChangesAsync();

            return Ok(returnDTO);
        }

        [HttpPost]
        [Authorize]
        [Route("resolution/{joinrequestId:guid}")]
        public async Task<IActionResult> JoinResolution(Guid joinrequestId, [FromBody] JoinRequestActionDTO actionDTO)
        {
            Guid userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            User user = (await dbcontext.Users.FindAsync(userId))!;

            JoinRequest? joinRequest = await dbcontext.JoinRequests.FindAsync(joinrequestId);
            if (joinRequest is null)
            {
                return NotFound();
            }
            // If user himself is canceling, the only action he can peform.
            if (actionDTO.Action == "Cancel" && joinRequest.UserId == userId)
            {
                dbcontext.JoinRequests.Remove(joinRequest);
                await dbcontext.SaveChangesAsync();
                return NoContent();
            }
            // At this point, user is either not allowed to perform any action
            // or is an admin within the organization.
            Membership? membership = await dbcontext.Memberships.FirstOrDefaultAsync(m => m.UserId == userId && m.OrganizationId == joinRequest.OrganizationId);
            if (membership is null) 
            {
                return Forbid();
            }
            if (actionDTO.Action == "Deny" && membership.Role == "Admin")
            {
                dbcontext.JoinRequests.Remove(joinRequest);
            }
            if(actionDTO.Action == "Allow" && membership.Role == "Admin")
            {
                Organization organization = (await dbcontext.Organizations.FindAsync(joinRequest.OrganizationId))!;
                Membership newMembership = new()
                {
                    OrganizationId = joinRequest.OrganizationId,
                    Organization = organization,
                    Role = actionDTO.Role!, // At this point, since admin is creating this membership, role is implied to be assigned (required at frontend)
                    User = joinRequest.User,
                    UserId = joinRequest.UserId
                };
                await dbcontext.Memberships.AddAsync(newMembership);
                dbcontext.JoinRequests.Remove(joinRequest);
            }

            await dbcontext.SaveChangesAsync();
            return NoContent();
            
        }
    }
}
