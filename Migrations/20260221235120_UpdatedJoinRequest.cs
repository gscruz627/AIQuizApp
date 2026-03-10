using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AIQuizApp.Migrations
{
    /// <inheritdoc />
    public partial class UpdatedJoinRequest : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_JoinRequests_OrganizationId",
                table: "JoinRequests",
                column: "OrganizationId");

            migrationBuilder.CreateIndex(
                name: "IX_JoinRequests_UserId",
                table: "JoinRequests",
                column: "UserId");

            migrationBuilder.AddForeignKey(
                name: "FK_JoinRequests_Organizations_OrganizationId",
                table: "JoinRequests",
                column: "OrganizationId",
                principalTable: "Organizations",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_JoinRequests_Users_UserId",
                table: "JoinRequests",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_JoinRequests_Organizations_OrganizationId",
                table: "JoinRequests");

            migrationBuilder.DropForeignKey(
                name: "FK_JoinRequests_Users_UserId",
                table: "JoinRequests");

            migrationBuilder.DropIndex(
                name: "IX_JoinRequests_OrganizationId",
                table: "JoinRequests");

            migrationBuilder.DropIndex(
                name: "IX_JoinRequests_UserId",
                table: "JoinRequests");
        }
    }
}
