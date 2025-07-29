const axios = require("axios");

exports.verifyPaystackPayment = async (reference) => {
  const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;

  try {
    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET}`,
        },
      }
    );

    return response.data.data; // Paystack's data
  } catch (err) {
    console.error(
      `❌ Paystack verification error for ${reference}:`,
      err.response?.data || err.message
    );
    throw new Error("Paystack verification request failed");
  }
};

exports.verifyCinetpayPayment = async (transaction_id) => {
  const API_KEY = process.env.CINETPAY_API_KEY;
  const SITE_ID = process.env.CINETPAY_SITE_ID;

  try {
    const response = await axios.post(
      "https://api-checkout.cinetpay.com/v2/payment/check",
      {
        apikey: API_KEY,
        site_id: SITE_ID,
        transaction_id,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const data = response.data;

    if (data.code !== "00") {
      console.error(`❌ CinetPay verification failed:`, data.message);
      throw new Error("CinetPay transaction not successful");
    }

    return data.data; // This includes status, amount, currency, etc.
  } catch (err) {
    console.error(
      `❌ CinetPay verification error for ${transaction_id}:`,
      err.response?.data || err.message
    );
    throw new Error("CinetPay verification request failed");
  }
};
