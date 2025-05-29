using AToyStore.Core.Payments.Entities;
using AToyStore.Core.Payments.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace AToyStore.Infrastructure.Payments;

public class PaymentRepository : IPaymentRepository
{
    private readonly AppDbContext _context;

    public PaymentRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task AddAsync(PaymentTransaction transaction)
    {
        _context.PaymentTransactions.Add(transaction);
        await _context.SaveChangesAsync();
    }

    public async Task<PaymentTransaction?> GetByPaymentIdAsync(string paymentId)
    {
        return await _context.PaymentTransactions
            .FirstOrDefaultAsync(p => p.PaymentId == paymentId);
    }

    public async Task UpdateStatusAsync(string paymentId, string status, bool paid)
    {
        var transaction = await _context.PaymentTransactions
            .FirstOrDefaultAsync(p => p.PaymentId == paymentId);

        if (transaction != null)
        {
            transaction.Status = status;
            transaction.Paid = paid;
            await _context.SaveChangesAsync();
        }
    }

    public async Task<PaymentTransaction?> GetByOrderIdAsync(Guid orderId)
    {
        return await _context.PaymentTransactions
            .FirstOrDefaultAsync(p => p.OrderId == orderId);
    }
}
