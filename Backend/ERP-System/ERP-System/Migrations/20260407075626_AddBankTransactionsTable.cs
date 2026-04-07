using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERP_System.Migrations
{
    /// <inheritdoc />
    public partial class AddBankTransactionsTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_BankTransaction_Banks_BankId",
                table: "BankTransaction");

            migrationBuilder.DropPrimaryKey(
                name: "PK_BankTransaction",
                table: "BankTransaction");

            migrationBuilder.RenameTable(
                name: "BankTransaction",
                newName: "BankTransactions");

            migrationBuilder.RenameIndex(
                name: "IX_BankTransaction_BankId",
                table: "BankTransactions",
                newName: "IX_BankTransactions_BankId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_BankTransactions",
                table: "BankTransactions",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_BankTransactions_Banks_BankId",
                table: "BankTransactions",
                column: "BankId",
                principalTable: "Banks",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_BankTransactions_Banks_BankId",
                table: "BankTransactions");

            migrationBuilder.DropPrimaryKey(
                name: "PK_BankTransactions",
                table: "BankTransactions");

            migrationBuilder.RenameTable(
                name: "BankTransactions",
                newName: "BankTransaction");

            migrationBuilder.RenameIndex(
                name: "IX_BankTransactions_BankId",
                table: "BankTransaction",
                newName: "IX_BankTransaction_BankId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_BankTransaction",
                table: "BankTransaction",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_BankTransaction_Banks_BankId",
                table: "BankTransaction",
                column: "BankId",
                principalTable: "Banks",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
