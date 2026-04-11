namespace AIQuizApp.Data
{
    public class SubmitQuizDTO
    {
        public required Guid QuizId { get; set; }
        public required int Score { get; set; }
    }
}
