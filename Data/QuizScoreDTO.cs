namespace AIQuizApp.Data
{
    public class QuizScoreDTO
    {
        public required string Name { get; set; }
        public required string Email { get; set; }
        public required Guid UserId { get; set; }
        public required int Score { get; set; }
    }
}
