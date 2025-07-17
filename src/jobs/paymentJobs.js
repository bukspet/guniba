const cron = require("node-cron");
const Payment = require("../models/Payment");
const paymentService = require("../services/paymentService");

exports.startPaymentFallbackJob = () => {
  cron.schedule("*/5 * * * *", async () => {
    console.log("Running payment fallback check...");

    const pendingPayments = await Payment.find({
      method: "paystack",
      status: "pending",
    });

    for (const payment of pendingPayments) {
      try {
        const transformedItems = payment.items.map((item) => ({
          variantId: item.id, // Convert to match Order schema
          price: item.price,
          quantity: item.quantity,
        }));

        await paymentService.verifyAndCompletePaystackPayment(
          payment.reference,
          transformedItems, // pass to service if needed
          payment.amount
        );
      } catch (err) {
        console.error(
          `Error verifying payment ${payment.reference}:`,
          err.message
        );
      }
    }
  });
};
