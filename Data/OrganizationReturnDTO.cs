namespace AIQuizApp.Data
{
    public class OrganizationReturnDTO
    {
        public required string Name { get; set; }
        public required string Role { get; set; }
        public List<UserInOrgDTO>? Members { get; set; }
        public int? JoinCode { get; set; }
    }
}
