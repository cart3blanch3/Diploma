namespace AToyStore.API.DTOs.Orders
{
    public class CreateShippingInfoDto
    {
        public string Address { get; set; } = string.Empty;
        public string City { get; set; } = "Костанай";
        public string Country { get; set; } = "Казахстан";
    }
}
