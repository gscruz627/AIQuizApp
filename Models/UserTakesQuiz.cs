using System.Text.Json.Serialization;

namespace AIQuizApp.Models
{
    public class UserTakesQuiz
    {
        public Guid Id { get; set; }
        public required Guid UserId { get; set; }
        [JsonIgnore]
        public required User User { get; set; }
        public required Guid QuizId { get; set; }
        public required int Score { get; set; }
    }
}
