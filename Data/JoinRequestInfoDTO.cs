namespace AIQuizApp.Data
{
    public class JoinRequestInfoDTO
    {
        public Guid Id { get; set; }
        public required string Name { get; set; }
        public required string Email { get; set; }

        public required string OrgName { get; set; }

    }
}
