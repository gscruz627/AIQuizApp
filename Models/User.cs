namespace AIQuizApp.Models
{
    public class User
    {
        public Guid Id { get; set; }
        public required string Name { get; set; }
        public required string Email { get; set; }
        public required string Password { get; set; }
        public string? AccessToken { get; set; }
        public string? RefreshToken { get; set; }
        public DateTime? RefreshTokenExpires { get; set; }
        public List<Membership> Membership { get; set; } = [];

        public List<UserLikedQuiz> LikedQuizzes { get; set; } = [];
        public List<UserSavedQuiz> SavedQuizzes { get; set; } = [];
    }
}
