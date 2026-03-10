using AIQuizApp.Models;
using System.Text.Json.Serialization;

namespace AIQuizApp.Data
{
    public class OrganizationInfoDTO
    {
        public Guid Id { get; set; }
        public required string Name { get; set; }
        public required string Role { get; set; }
    }
}
