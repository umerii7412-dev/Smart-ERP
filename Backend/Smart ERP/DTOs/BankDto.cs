namespace ERP.API.DTOs
{
    public class BankDto
    {
        public string BankName { get; set; }
        public string AccountTitle { get; set; }
        // Yaad rahe: "Account Number" field humne user ki instruction par pehle delete kar di thi.
        // Isliye yahan sirf zaroori details rakhenge.
        public string BranchCode { get; set; }
    }
}