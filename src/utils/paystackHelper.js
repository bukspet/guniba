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
