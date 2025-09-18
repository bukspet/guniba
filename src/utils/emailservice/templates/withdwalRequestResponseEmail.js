const { sendEmail } = require("../emailService");

async function sendWithdrawalStatusEmail(email, withdrawal) {
  try {
    const sender = "Guniba <postmaster@mail.guniba.net>";
    const status =
      withdrawal.status === "approved" ? "Approved ✅" : "Rejected ❌";

    const subject = `Withdrawal Request ${status} - ₦${withdrawal.amount.toLocaleString()}`;

    const messageTemplate = () => {
      if (withdrawal.status === "approved") {
        return `
          <p>Hello,</p>
          <p>Good news! 🎉 Your withdrawal request has been <b>approved</b> and your funds are on the way.</p>

          <p><b>Reference:</b> ${withdrawal.requestId}</p>
          <p><b>Amount:</b> ₦${withdrawal.amount.toLocaleString()}</p>
          <p><b>Status:</b> Approved ✅</p>

          <p>The transfer will reflect in your bank account shortly.</p>

          <p>Thank you for trusting Guniba!</p>
          <p>— The Guniba Team</p>
        `;
      } else {
        return `
          <p>Hello,</p>
          <p>Unfortunately, your withdrawal request has been <b>rejected</b>.</p>

          <p><b>Reference:</b> ${withdrawal.requestId}</p>
          <p><b>Amount:</b> ₦${withdrawal.amount.toLocaleString()}</p>
          <p><b>Status:</b> Rejected ❌</p>
          <p><b>Reason:</b> ${
            withdrawal.reasonForRejection || "Not specified"
          }</p>

          <p>Please review your request and try again, or contact support if you need further assistance.</p>

          <p>— The Guniba Team</p>
        `;
      }
    };

    const emailSent = await sendEmail({
      sender,
      recipient: email,
      subject,
      messageTemplate,
    });

    if (!emailSent || emailSent.message !== "Queued. Thank you.") {
      console.error(
        "❌ Failed to send withdrawal status email:",
        email,
        emailSent
      );
      return null;
    }

    return emailSent;
  } catch (error) {
    console.error("❌ Error sending withdrawal status email:", error.message);
    return null;
  }
}

module.exports = { sendWithdrawalStatusEmail };
