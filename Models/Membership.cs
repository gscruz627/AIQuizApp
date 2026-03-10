using System.Text.Json.Serialization;

namespace AIQuizApp.Models
{
    public class Membership
    {
        public Guid Id { get; set; }
        public required Guid UserId { get; set; }
        [JsonIgnore]
        public required User User { get; set; }
        public required Guid OrganizationId { get; set; }
        [JsonIgnore]
        public required Organization Organization { get; set; }
        public required string Role { get; set; }

    }
}
