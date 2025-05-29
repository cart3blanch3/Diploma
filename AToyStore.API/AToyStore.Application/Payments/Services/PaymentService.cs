using AToyStore.Application.Payments.Interfaces;
using AToyStore.Core.Payments.Entities;
using AToyStore.Core.Payments.Interfaces;
using Microsoft.Extensions.Logging;

namespace AToyStore.Application.Payments.Services;

public class PaymentService : IPaymentService
{
    private readonly IYooKassaClient _yooKassaClient;
    private readonly IPaymentRepository _paymentRepository;
    private readonly ILogger<PaymentService> _logger;

    public PaymentService(
        IYooKassaClient yooKassaClient,
        IPaymentRepository paymentRepository,
        ILogger<PaymentService> logger)
    {
        _yooKassaClient = yooKassaClient;
        _paymentRepository = paymentRepository;
        _logger = logger;
    }

    public async Task<PaymentResponse> CreatePaymentAsync(CreatePaymentRequest request)
    {
        // 1. создаём платёж (без paymentId в returnUrl, пока)
        var initialRequest = new CreatePaymentRequest
        {
            UserId = request.UserId,
            OrderId = request.OrderId,
            Amount = request.Amount,
            Description = request.Description,
            ReturnUrl = request.ReturnUrl 
        };

        var response = await _yooKassaClient.CreatePaymentAsync(initialRequest);

        // 2. сохраняем в БД
        var transaction = new PaymentTransaction
        {
            Id = Guid.NewGuid(),
            PaymentId = response.Id,
            UserId = request.UserId,
            Amount = request.Amount,
            Description = request.Description,
            Status = response.Status,
            OrderId = Guid.Parse(request.OrderId),
            CreatedAt = DateTime.UtcNow
        };

        await _paymentRepository.AddAsync(transaction);

        return new PaymentResponse
        {
            Id = response.Id,
            Status = response.Status,
            ConfirmationUrl = response.ConfirmationUrl // 👈 теперь клиент будет редиректнут с paymentId
        };
    }

    public async Task<PaymentStatusResponse> CheckPaymentStatusAsync(string paymentId)
    {
        var status = await _yooKassaClient.GetPaymentStatusAsync(paymentId);

        var transaction = await _paymentRepository.GetByPaymentIdAsync(paymentId);
        if (transaction != null)
        {
            transaction.Status = status.Status;
            transaction.UpdatedAt = DateTime.UtcNow;
            await _paymentRepository.UpdateStatusAsync(paymentId, status.Status, status.Paid);

            // 👇 Возвратим OrderId из БД
            return new PaymentStatusResponse
            {
                Id = paymentId,
                Status = status.Status,
                Paid = status.Paid,
                OrderId = transaction.OrderId.ToString()
            };
        }

        // fallback (если не нашли транзакцию)
        return new PaymentStatusResponse
        {
            Id = paymentId,
            Status = status.Status,
            Paid = status.Paid,
            OrderId = string.Empty
        };
    }
    public async Task<PaymentTransaction?> GetPaymentByOrderIdAsync(Guid orderId)
    {
        return await _paymentRepository.GetByOrderIdAsync(orderId);
    }
}
