const FormData = require("form-data");
const Mailgun = require("mailgun.js");
require("dotenv").config(); // Load environment variables

const MAILGUN_API_KEY = process.env.MAILGUN_API_KEY;
const MAILGUN_DOMAIN = process.env.MAILGUN_DOMAIN || "mail.clufo.ch";

async function sendEmail({ sender, recipient, subject, messageTemplate }) {
  try {
    const mailgun = new Mailgun(FormData);
    const mg = mailgun.client({
      username: "api",
      key: MAILGUN_API_KEY,
    });

    const message = messageTemplate();

    const response = await mg.messages.create(MAILGUN_DOMAIN, {
      from: sender,
      to: recipient,
      subject,
      html: message,
    });

    console.log("✅ Email sent successfully:", response);
    return response;
  } catch (error) {
    console.error("❌ Failed to send email:", error);
    return null;
  }
}

module.exports = { sendEmail };
