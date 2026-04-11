using AIQuizApp.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using System.Text.Json;


namespace AIQuizApp.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions options) : base(options)
        {

        }
        public DbSet<User> Users { get; set; }
        public DbSet<Quiz> Quizzes { get; set; }
        public DbSet<Organization> Organizations { get; set; }
        public DbSet<Membership> Memberships { get; set; }
        public DbSet<JoinRequest> JoinRequests { get; set; }
        public DbSet<UserSavedQuiz> SavedQuizzes { get; set; }
        public DbSet<UserTakesQuiz> TakenQuizzes { get; set; }

protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<UserLikedQuiz>()
    .HasKey(x => new { x.UserId, x.QuizId });
            modelBuilder.Entity<UserSavedQuiz>()
    .HasKey(x => new { x.UserId, x.QuizId });


            var jsonOptions = new JsonSerializerOptions(JsonSerializerDefaults.General);

        modelBuilder.Entity<Quiz>()
            .Property(q => q.Questions)
            .HasColumnType("jsonb")
            .HasConversion(
                v => JsonSerializer.Serialize(v, jsonOptions),
                v => JsonSerializer.Deserialize<List<string>>(v, jsonOptions)!,
                new ValueComparer<List<string>>(
                    (c1, c2) => c1!.SequenceEqual(c2!),
                    c => c.Aggregate(0, (a, v) => HashCode.Combine(a, v.GetHashCode())),
                    c => c.ToList()
                )
            );

        modelBuilder.Entity<Quiz>()
            .Property(q => q.CorrectAnswerIndices)
            .HasColumnType("jsonb")
            .HasConversion(
                v => JsonSerializer.Serialize(v, jsonOptions),
                v => JsonSerializer.Deserialize<List<int>>(v, jsonOptions)!,
                new ValueComparer<List<int>>(
                    (c1, c2) => c1!.SequenceEqual(c2!),
                    c => c.Aggregate(0, (a, v) => HashCode.Combine(a, v.GetHashCode())),
                    c => c.ToList()
                )
            );

        modelBuilder.Entity<Quiz>()
            .Property(q => q.Answers)
            .HasColumnType("jsonb")
            .HasConversion(
                v => JsonSerializer.Serialize(v, jsonOptions),
                v => JsonSerializer.Deserialize<List<List<string>>>(v, jsonOptions)!,
                new ValueComparer<List<List<string>>>(
                    (c1, c2) => c1!.SelectMany(x => x).SequenceEqual(c2!.SelectMany(x => x)),
                    c => c.SelectMany(x => x)
                          .Aggregate(0, (a, v) => HashCode.Combine(a, v.GetHashCode())),
                    c => c.Select(x => x.ToList()).ToList()
                )
            );
    }


}
}
