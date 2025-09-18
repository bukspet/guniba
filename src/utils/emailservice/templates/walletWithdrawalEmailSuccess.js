const { sendEmail } = require("../emailService");

async function sendWithdrawalToWalletEmail(email, withdrawal, user) {
  try {
    const sender = "Guniba <postmaster@mail.guniba.net>";
    const subject = `✅ Withdrawal of ₦${withdrawal.amount.toLocaleString()} Successful`;

    const messageTemplate = () => `
      <p>Hello ${user.fullName || ""},</p>
      <p>We’re happy to let you know that your withdrawal to wallet was successful 🎉.</p>

      <p><b>Transaction Details:</b></p>
      <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
        <tbody>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;"><b>Transaction ID</b></td>
            <td style="padding: 8px; border: 1px solid #ddd;">${
              withdrawal.transactionId
            }</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;"><b>Type</b></td>
            <td style="padding: 8px; border: 1px solid #ddd;">${
              withdrawal.type
            }</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;"><b>Amount</b></td>
            <td style="padding: 8px; border: 1px solid #ddd;">₦${withdrawal.amount.toLocaleString()}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;"><b>Status</b></td>
            <td style="padding: 8px; border: 1px solid #ddd; color: green;">${
              withdrawal.status
            }</td>
          </tr>
        </tbody>
      </table>

      <p style="margin-top: 15px; font-size: 1.1em;">
        <b>New Wallet Balance:</b> ₦${user.wallet.toLocaleString()}
      </p>

      <p>Your funds are now available in your wallet and ready to use for transactions on <b>Guniba</b>.</p>

      <p>Thank you for trusting us!</p>
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
        "❌ Failed to send withdrawal email for:",
        email,
        emailSent
      );
      return null;
    }

    return emailSent;
  } catch (error) {
    console.error("❌ Error sending withdrawal email:", error.message);
    return null;
  }
}

module.exports = { sendWithdrawalToWalletEmail };
