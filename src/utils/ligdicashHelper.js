// helpers/ligdicash.js
const axios = require("axios");

const BASE_URL =
  process.env.LIGDICASH_BASE_URL || "https://app.ligdicash.com/pay/v01";
const API_KEY = process.env.LIGDICASH_API_KEY;
const API_TOKEN = process.env.LIGDICASH_API_TOKEN;

if (!API_KEY || !API_TOKEN) {
  console.warn("⚠️ LIGDICASH_API_KEY or LIGDICASH_API_TOKEN is missing.");
}

const client = axios.create({
  baseURL: BASE_URL,
  headers: {
    Apikey: API_KEY,
    Authorization: `Bearer ${API_TOKEN}`,
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

async function createInvoice(payload) {
  try {
    const { data } = await client.post(
      "/redirect/checkout-invoice/create",
      payload
    );
    // Ligdicash typically returns { response_code, response_text, token, status? ... }
    return data;
  } catch (err) {
    const details = err.response?.data || err.message;
    console.error("❌ Ligdicash createInvoice error:", details);
    throw new Error("Failed to create Ligdicash invoice");
  }
}

/**
 * Confirm/check invoice.
 * Some integrations expose /confirm or /check endpoints; we’ll support both.
 * Prefer /redirect/checkout-invoice/confirm if available in your account.
 */
async function confirmInvoice(invoiceToken) {
  try {
    console.log("🔍 Confirming invoice with token:", invoiceToken);

    // GET request with query param
    const { data } = await client.get(`/redirect/checkout-invoice/confirm`, {
      params: { invoiceToken }, // ?invoiceToken=<token>
    });

    return data;
  } catch (err) {
    const details = err.response?.data || err.message;
    console.error("❌ Ligdicash confirmInvoice error:", details);
    throw new Error("Failed to confirm Ligdicash invoice");
  }
}

module.exports = {
  createInvoice,
  confirmInvoice,
};
