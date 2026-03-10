using System.Text.Json.Serialization;

namespace AIQuizApp.Models
{
    public class JoinRequest
    {
        public Guid Id { get; set; }
        public required Guid UserId { get; set; }
        [JsonIgnore]
        public User User { get; set; }
        [JsonIgnore]
        public Organization Organization { get; set; }
        public required Guid OrganizationId { get; set; }
    }
}
