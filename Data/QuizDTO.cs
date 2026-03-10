using AIQuizApp.Models;
using System.Text.Json.Serialization;

namespace AIQuizApp.Data
{
    public class QuizDTO
    {
        public required string Title { get; set; }

        public List<string> Questions { get; set; } = new();
        public List<List<string>> Answers { get; set; } = new();
        public List<int> CorrectAnswerIndices { get; set; } = new();

        public Guid? OrganizationId { get; set; }
    }
}
