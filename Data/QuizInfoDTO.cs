namespace AIQuizApp.Data
{
    public class QuizInfoDTO
    {
        public required Guid Id { get; set; }
        public required string Title { get; set; }
        public required string AuthorName { get; set; }
        public required Guid AuthorId { get; set; }
        public required DateTime CreatedAt { get; set; }
    }
}
