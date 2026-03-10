using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AIQuizApp.Migrations
{
    /// <inheritdoc />
    public partial class AddedSavedQuizzesDbSet : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_UserSavedQuiz_Quizzes_QuizId",
                table: "UserSavedQuiz");

            migrationBuilder.DropForeignKey(
                name: "FK_UserSavedQuiz_Users_UserId",
                table: "UserSavedQuiz");

            migrationBuilder.DropPrimaryKey(
                name: "PK_UserSavedQuiz",
                table: "UserSavedQuiz");

            migrationBuilder.RenameTable(
                name: "UserSavedQuiz",
                newName: "SavedQuizzes");

            migrationBuilder.RenameIndex(
                name: "IX_UserSavedQuiz_QuizId",
                table: "SavedQuizzes",
                newName: "IX_SavedQuizzes_QuizId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_SavedQuizzes",
                table: "SavedQuizzes",
                columns: new[] { "UserId", "QuizId" });

            migrationBuilder.AddForeignKey(
                name: "FK_SavedQuizzes_Quizzes_QuizId",
                table: "SavedQuizzes",
                column: "QuizId",
                principalTable: "Quizzes",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_SavedQuizzes_Users_UserId",
                table: "SavedQuizzes",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_SavedQuizzes_Quizzes_QuizId",
                table: "SavedQuizzes");

            migrationBuilder.DropForeignKey(
                name: "FK_SavedQuizzes_Users_UserId",
                table: "SavedQuizzes");

            migrationBuilder.DropPrimaryKey(
                name: "PK_SavedQuizzes",
                table: "SavedQuizzes");

            migrationBuilder.RenameTable(
                name: "SavedQuizzes",
                newName: "UserSavedQuiz");

            migrationBuilder.RenameIndex(
                name: "IX_SavedQuizzes_QuizId",
                table: "UserSavedQuiz",
                newName: "IX_UserSavedQuiz_QuizId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_UserSavedQuiz",
                table: "UserSavedQuiz",
                columns: new[] { "UserId", "QuizId" });

            migrationBuilder.AddForeignKey(
                name: "FK_UserSavedQuiz_Quizzes_QuizId",
                table: "UserSavedQuiz",
                column: "QuizId",
                principalTable: "Quizzes",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_UserSavedQuiz_Users_UserId",
                table: "UserSavedQuiz",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
