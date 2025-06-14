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
        await paymentService.verifyAndCompletePaystackPayment(
          payment.reference
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
