using System.Text.Json.Serialization;

namespace AIQuizApp.Models
{
    public class Organization
    {
        public Guid Id { get; set; }
        public required string Name { get; set; }
        public required Guid OwnerId { get; set; }
        [JsonIgnore]
        public User? Owner { get; set; }
        [JsonIgnore]
        public List<Membership> Members { get; set; } = [];
        [JsonIgnore]
        public List<Quiz> Quizzes { get; set; } = [];
        public int JoinCode { get; set; }
        
    }
}
