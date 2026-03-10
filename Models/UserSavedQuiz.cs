namespace AIQuizApp.Models
{
    public class UserSavedQuiz
    {
        public Guid UserId { get; set; }
        public User User { get; set; } = null!;

        public Guid QuizId { get; set; }
        public Quiz Quiz { get; set; } = null!;
    }
}
