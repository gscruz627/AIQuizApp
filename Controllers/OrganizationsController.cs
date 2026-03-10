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
                .Select(m => new OrganizationInfoDTO{
                    Id = m.OrganizationId,
                    Name = m.Organization.Name,
                    Role = m.Role
                }).ToListAsync();

            return Ok(organizations);
        }



        [HttpGet]
        [Route("{id:guid}")]
        public async Task<ActionResult<Organization>> GetOrganizationById(Guid id)
        {
            Organization? organization = await dbcontext.Organizations.FindAsync(id);
            if (organization is null)
            {
                return NotFound();
            }
            return Ok(organization);
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
    }
}
