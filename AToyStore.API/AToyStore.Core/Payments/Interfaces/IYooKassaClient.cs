using AToyStore.Core.Payments.Entities;

namespace AToyStore.Core.Payments.Interfaces;

public interface IYooKassaClient
{
    Task<PaymentResponse> CreatePaymentAsync(CreatePaymentRequest request);
    Task<PaymentStatusResponse> GetPaymentStatusAsync(string paymentId);
}
