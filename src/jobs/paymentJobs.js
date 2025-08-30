const cron = require("node-cron");
const Payment = require("../models/Payment");
const paymentService = require("../services/paymentService");

exports.startPaymentFallbackJob = () => {
  cron.schedule("*/5 * * * *", async () => {
    console.log("⏳ Running payment fallback check...");

    const pendingPayments = await Payment.find({
      status: "pending",
      method: { $in: ["paystack", "ligdicash"] }, // extendable if more methods later
    });

    for (const payment of pendingPayments) {
      try {
        let verificationResult;

        switch (payment.method) {
          case "paystack":
            verificationResult =
              await paymentService.verifyAndCompletePaystackPayment(
                payment.reference
              );
            break;

          case "ligdicash":
            verificationResult =
              await paymentService.verifyAndCompleteLigdicashPayment(
                payment.reference || payment.token // adjust to your model
              );
            break;

          default:
            console.warn(
              `⚠️ No fallback handler for payment method: ${payment.method}`
            );
            continue;
        }

        console.log(
          `✅ Verified ${payment.method} payment ${
            payment.reference || payment.token
          }:`,
          verificationResult?.status || "done"
        );
      } catch (err) {
        console.error(
          `❌ Error verifying ${payment.method} payment ${
            payment.reference || payment.token
          }:`,
          err.message
        );
      }
    }
  });
};
