using AIQuizApp.Data;
using AIQuizApp.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace AIQuizApp.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class OrganizationsController : Controller
    {
        private readonly AppDbContext dbcontext;
        public OrganizationsController(AppDbContext _dbcontext)
        {
            dbcontext = _dbcontext;
        }

        [HttpGet]
        [Route("info")]
        public async Task<ActionResult<List<OrganizationInfoDTO>>> GetOrganizationsInfo([FromQuery] Guid userId)
        {
            List<OrganizationInfoDTO> organizations = await dbcontext.Memberships.Include(m => m.Organization).Where(m => m.UserId == userId)
                .Select(m => new OrganizationInfoDTO {
                    Id = m.OrganizationId,
                    Name = m.Organization.Name,
                    Role = m.Role
                }).ToListAsync();

            return Ok(organizations);
        }



        [HttpGet]
        [Authorize]
        [Route("{id:guid}")]
        public async Task<ActionResult<OrganizationReturnDTO>> GetOrganizationById(Guid id)
        {
            Guid userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            Organization organization = (await dbcontext.Organizations.FindAsync(id))!;
            Membership? membership = await dbcontext.Memberships.Where(m => m.UserId == userId && m.OrganizationId == id).FirstOrDefaultAsync();
            if (membership is null)
            {
                return Unauthorized();
            }
            OrganizationReturnDTO returnDTO = new() { Name = organization.Name, Role = membership.Role };
            if (membership.Role != "student")
            {
                returnDTO.JoinCode = organization.JoinCode;
                List<UserInOrgDTO> returnmembers = await dbcontext.Memberships.Include(m => m.User).Where(m => m.OrganizationId == id && m.Role != "admin")
                    .Select(m => new UserInOrgDTO { Email = m.User.Email, Id = m.User.Id, Name = m.User.Name, Role = m.Role }).ToListAsync();
                returnDTO.Members = returnmembers;
            }
            if (organization is null)
            {
                return NotFound();
            }
            return Ok(returnDTO);
        }

        [HttpPost]
        [Authorize]
        public async Task<ActionResult<Organization>> CreateOrganization(OrganizationDTO organizationDTO)
        {
            Guid userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            User user = (await dbcontext.Users.FindAsync(userId))!;
            Random random = new();
            int joincode = 0;
            while (true)
            {
                joincode = random.Next(100000, 999999);
                bool exists = await dbcontext.Organizations.AnyAsync(o => o.JoinCode == joincode);
                if (!exists)
                {
                    break;
                }
            }

            Organization organization = new()
            {
                Name = organizationDTO.Name,
                OwnerId = userId,
                Owner = user,
                JoinCode = joincode
            };

            Membership membership = new()
            {
                Organization = organization,
                OrganizationId = organization.Id,
                Role = "Admin",
                User = user,
                UserId = userId,
            };

            await dbcontext.Organizations.AddAsync(organization);
            await dbcontext.Memberships.AddAsync(membership);
            await dbcontext.SaveChangesAsync();

            return CreatedAtAction(nameof(GetOrganizationById), new { organization.Id }, organization);

        }

        [HttpDelete]
        [Authorize]
        [Route("{id:guid}")]
        public async Task<IActionResult> DeleteOrganization(Guid id)
        {
            Guid userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            Organization organization = (await dbcontext.Organizations.FindAsync(id))!;
            if (organization is null)
            {
                return NotFound();
            }
            Membership? membership = await dbcontext.Memberships.Where(m => m.UserId == userId && m.OrganizationId == id).FirstOrDefaultAsync();
            if (membership is null)
            {
                return Unauthorized();
            }
            if (membership.Role != "Admin")
            {
                return Unauthorized();
            }
            dbcontext.Organizations.Remove(organization);
            await dbcontext.SaveChangesAsync();
            return NoContent();

        }
    }
}
