using AIQuizApp.Models;
using System.Text.Json.Serialization;

namespace AIQuizApp.Data
{
    public class QuizNoAnswersDTO
    {
        public Guid Id { get; set; }
        public required string Title { get; set; }

        public List<string> Questions { get; set; } = new();
        public List<List<string>> Answers { get; set; } = new();
        public DateTime CreatedAt { get; set; }

        public Guid? OrganizationId { get; set; }
        
        public Guid AuthorId { get; set; }
    }
}
