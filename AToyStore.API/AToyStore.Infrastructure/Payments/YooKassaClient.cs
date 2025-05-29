using AToyStore.Core.Payments.Interfaces;
using Yandex.Checkout.V3;
using Microsoft.Extensions.Logging;
using AToyStore.Core.Payments.Entities;

namespace AToyStore.Infrastructure.Payments;

public class YooKassaClient : IYooKassaClient
{
    private readonly Client _client;
    private readonly ILogger<YooKassaClient> _logger;

    public YooKassaClient(string shopId, string secretKey, ILogger<YooKassaClient> logger)
    {
        _client = new Client(shopId, secretKey);
        _logger = logger;
    }

    public async Task<PaymentResponse> CreatePaymentAsync(CreatePaymentRequest request)
    {
        var paymentRequest = new NewPayment
        {
            Amount = new Amount
            {
                Value = request.Amount,
                Currency = "RUB"
            },
            Confirmation = new Confirmation
            {
                Type = ConfirmationType.Redirect,
                ReturnUrl = request.ReturnUrl
            },
            Description = request.Description,
            Metadata = new Dictionary<string, string>
            {
                { "orderId", request.OrderId },
                { "userId", request.UserId }
            }
        };

        try
        {
            var response = await Task.Run(() => _client.CreatePayment(paymentRequest));

            return new PaymentResponse
            {
                Id = response.Id,
                Status = response.Status.ToString(),
                ConfirmationUrl = response.Confirmation.ConfirmationUrl
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Ошибка при создании платежа через YooKassa");
            throw;
        }
    }

    public async Task<PaymentStatusResponse> GetPaymentStatusAsync(string paymentId)
    {
        try
        {
            var payment = await Task.Run(() => _client.GetPayment(paymentId));

            return new PaymentStatusResponse
            {
                Id = payment.Id,
                Status = payment.Status.ToString(),
                Paid = payment.Paid
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Ошибка при получении статуса платежа: {PaymentId}", paymentId);
            throw;
        }
    }
}
