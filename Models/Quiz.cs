using AIQuizApp.Models;
using System.Text.Json.Serialization;

public class Quiz
{
    public Guid Id { get; set; }
    public required string Title { get; set; }

    public List<string> Questions { get; set; } = new();
    public List<List<string>> Answers { get; set; } = new();
    public List<int> CorrectAnswerIndices { get; set; } = new();

    public int Likes { get; set; } = 0;

    public Guid? OrganizationId { get; set; }
    [JsonIgnore]
    public Organization? Organization { get; set; }

    public Guid AuthorId { get; set; }
    [JsonIgnore]
    public User Author { get; set; } = null!;
}
