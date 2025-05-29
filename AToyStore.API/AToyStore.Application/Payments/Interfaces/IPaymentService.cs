using AToyStore.Core.Payments.Entities;

namespace AToyStore.Application.Payments.Interfaces;

public interface IPaymentService
{
    Task<PaymentResponse> CreatePaymentAsync(CreatePaymentRequest request);
    Task<PaymentStatusResponse> CheckPaymentStatusAsync(string paymentId);
    Task<PaymentTransaction?> GetPaymentByOrderIdAsync(Guid orderId);
}
