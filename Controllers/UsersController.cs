using AIQuizApp.Data;
using AIQuizApp.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

namespace AIQuizApp.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UsersController : ControllerBase
    {
        private readonly AppDbContext dbcontext;
        public UsersController(AppDbContext _dbcontext)
        {
            dbcontext = _dbcontext;
        }
        [HttpGet]
        [Route("{id:guid}")]
        public async Task<ActionResult<UserDTO>> GetUserById(Guid id)
        {
            User user = await dbcontext.Users.FindAsync(id);
            if (user is null)
            {
                return NotFound();
            }
            UserDTO returnUser = new()
            {
                Name = user.Name,
                Email = user.Email,
            };
            return Ok(returnUser);
        }

        [HttpPost]
        public async Task<IActionResult> Register([FromBody] RegisterDTO registerDTO)
        {
            User? alreadyUser = await dbcontext.Users.Where(u => u.Email == registerDTO.Email).FirstOrDefaultAsync();
            if (alreadyUser is not null)
            {
                return Conflict("User already exists");
            };
            PasswordHasher<User> hasher = new();
            User user = new()
            {
                Email = registerDTO.Email,
                Name = registerDTO.Name,
                Password = hasher.HashPassword(null, registerDTO.Password)
            };
            await dbcontext.Users.AddAsync(user);
            await dbcontext.SaveChangesAsync();
            UserDTO returnDTO = new()
            {
                Email = user.Email,
                Name = user.Name
            };
            return NoContent();
        }

        [HttpPost]
        [Route("login")]
        public async Task<ActionResult<TokensDTO>> Login([FromBody] LoginDTO loginDTO)
        {
            User? user = await dbcontext.Users.Where(u => u.Email == loginDTO.Email).FirstOrDefaultAsync();
            if (user is null)
            {
                return BadRequest("Authentication failed");
            }
            PasswordHasher<User> hasher = new();
            PasswordVerificationResult pwdCheck = hasher.VerifyHashedPassword(null, user.Password, loginDTO.Password);
            if (!(pwdCheck == PasswordVerificationResult.Success))
            {
                return BadRequest("Authentication failed");
            }
            string accessToken = GenerateAccessToken(user);
            string refreshToken = GenerateRefreshToken();
            DateTime refreshTokenExpiry = DateTime.UtcNow.AddDays(7);
            user.AccessToken = accessToken;
            user.RefreshToken = refreshToken;
            user.RefreshTokenExpires = refreshTokenExpiry;

            await dbcontext.SaveChangesAsync();

            TokensDTO tokensDTO = new()
            {
                AccessToken = accessToken,
                RefreshToken = refreshToken
            };
            return Ok(tokensDTO);
        }

        [HttpPost]
        [Route("refresh-token")]
        public async Task<ActionResult<TokensDTO>> RefreshToken(TokensDTO input)
        {
            if (input is null || String.IsNullOrEmpty(input.RefreshToken))
            {
                return Unauthorized("Invalid Data");
            }
            User? user = await dbcontext.Users.FirstOrDefaultAsync(u => u.RefreshToken == input.RefreshToken);
            if (user is null || user.RefreshTokenExpires <= DateTime.UtcNow)
            {
                return Unauthorized("Invalid User or expired Refresh Token");
            }
            string accessToken = GenerateAccessToken(user);
            string refreshToken = GenerateRefreshToken();

            user.RefreshToken = refreshToken;
            user.RefreshTokenExpires = DateTime.UtcNow.AddDays(7);

            TokensDTO response = new()
            {
                AccessToken = accessToken,
                RefreshToken = refreshToken
            };

            return Ok(response);
        }


        [NonAction]
        public string GenerateAccessToken(User user)
        {
            List<Claim> claims = [
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Name, user.Email),
                new Claim("name", user.Name)
            ];
            SymmetricSecurityKey key = new(Encoding.UTF8.GetBytes("q9H+f7v4ZsX2bL9pV1JkR8wM3u6nY0dPq7xC5vF2bG1=q9H+f7v4ZsX2bL9pV1JkR8wM3u6nY0dPq7xC5vF2bG1="));
            SigningCredentials credentials = new(key, SecurityAlgorithms.HmacSha512);
            JwtSecurityToken tokenDescriptor = new(
                issuer: "AIQUIZ_Issuer_Class493",
                audience: "*",
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(15),
                signingCredentials: credentials
            );
            return new JwtSecurityTokenHandler().WriteToken(tokenDescriptor);
        }

        [NonAction]
        public string GenerateRefreshToken()
        {
            byte[] randomNumber = new byte[32];

            using var rg = RandomNumberGenerator.Create();
            rg.GetBytes(randomNumber);
            return Convert.ToBase64String(randomNumber);
        }
    }
}
