const { sendEmail } = require("../emailService");

async function sendWithdrawalToBankPendingEmail(email, withdrawal, card) {
  try {
    const sender = "Guniba <postmaster@mail.guniba.net>";
    const subject = `Withdrawal Request Pending - $${withdrawal.amount.toLocaleString()}`;

    const messageTemplate = () => `
      <p>Hello,</p>
      <p>We have received your withdrawal request. 🎉</p>

      <p><b>Reference:</b> ${withdrawal.requestId}</p>
      <p><b>Amount:</b>$${withdrawal.amount.toLocaleString()}</p>
      <p><b>Status:</b> Pending Review</p>

      <p><b>Payout Bank:</b> ${card.bank} (${card.accountNumber})</p>
      <p><b>Account Name:</b> ${card.accountName}</p>

      <p>Your request is currently <b>pending</b> and will be reviewed by our team shortly. 
      You will be notified once it has been approved and the funds are sent to your bank account.</p>

      <p>Thank you for trusting Guniba!</p>
      <p>— The Guniba Team</p>
    `;

    const emailSent = await sendEmail({
      sender,
      recipient: email,
      subject,
      messageTemplate,
    });

    if (!emailSent || emailSent.message !== "Queued. Thank you.") {
      console.error(
        "❌ Failed to send withdrawal pending email:",
        email,
        emailSent
      );
      return null;
    }

    return emailSent;
  } catch (error) {
    console.error("❌ Error sending withdrawal pending email:", error.message);
    return null;
  }
}

module.exports = { sendWithdrawalToBankPendingEmail };
