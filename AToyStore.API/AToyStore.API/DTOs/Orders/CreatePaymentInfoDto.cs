namespace AToyStore.API.DTOs.Orders
{
    public class CreatePaymentInfoDto
    {
        public string Method { get; set; } = string.Empty;
        public bool IsPaid { get; set; }
    }
}
