using AToyStore.Core.Payments.Entities;

namespace AToyStore.Core.Payments.Interfaces;

public interface IPaymentRepository
{
    Task AddAsync(PaymentTransaction transaction);
    Task<PaymentTransaction?> GetByPaymentIdAsync(string paymentId);
    Task UpdateStatusAsync(string paymentId, string status, bool paid);
    Task<PaymentTransaction?> GetByOrderIdAsync(Guid orderId);
}
