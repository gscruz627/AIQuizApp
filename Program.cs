using AIQuizApp.Data;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddDbContext<AppDbContext>(options =>
{
    options.UseNpgsql("Host=bngpnfevvvfckhccj4wl-postgresql.services.clever-cloud.com;Port=5432;Database=bngpnfevvvfckhccj4wl;Username=u6tmewhxdqbrn8qtlrdu;Password=MaBetM1nHicpJ7LBmRe0iimsAG1LAP;Ssl Mode=Require;Trust Server Certificate=true");
    options.EnableSensitiveDataLogging();
    options.EnableDetailedErrors();
});

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
.AddJwtBearer(options => {
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = false,
        ValidIssuer = "*",
        ValidateAudience = false,
        ValidAudience = "*",
        ValidateLifetime = true,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes("q9H+f7v4ZsX2bL9pV1JkR8wM3u6nY0dPq7xC5vF2bG1=q9H+f7v4ZsX2bL9pV1JkR8wM3u6nY0dPq7xC5vF2bG1=")),
        ValidateIssuerSigningKey = true
    };
});

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll",
        policy =>
        {
            policy
                .SetIsOriginAllowed(_ => true)
                .AllowAnyMethod()
                .AllowAnyHeader();
        });
});


builder.Services.AddControllers();

var app = builder.Build();

app.UseRouting();

app.UseCors("AllowAll");

app.UseAuthentication();
app.UseAuthorization();

app.UseHttpsRedirection();

app.MapControllers();

app.Run();