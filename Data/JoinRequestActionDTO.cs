namespace AIQuizApp.Data
{
    public class JoinRequestActionDTO
    {
        public required string Action { get; set; } // Out of 'Approve', 'Deny', 'Cancel (By supplicant)'
        public string? Role { get; set; } // Student or Instructor
    }
}
