const { sendEmail } = require("../emailService");

async function sendResetPasswordEmail(email, resetCode) {
  try {
    const sender = "Guniba <postmaster@mail.guniba.net>";
    const subject = "Your Password Reset Code";

    const messageTemplate = () => `
      <p>Hello,</p>
      <p>You have requested to reset your password for your Guniba account.</p>
      <p>Please use the following code to reset your password:</p>
      <p style="font-size: 1.5em; margin-top: 10px; margin-bottom: 10px;">${resetCode}</p>
      <p>Enter this code on the password reset page.</p>
      <p>This code will expire in 60 minutes.</p>
      <p>If you did not request a password reset, please ignore this email. Your password will remain unchanged.</p>
      <p>Thank you,</p>
      <p>Guniba Team</p>
    `;

    const emailSent = await sendEmail({
      sender,
      recipient: email,
      subject,
      messageTemplate,
    });

    if (!emailSent || emailSent.message !== "Queued. Thank you.") {
      console.error(
        "❌ Failed to send password reset email for:",
        email,
        emailSent
      );
      return null;
    }

    return emailSent;
  } catch (error) {
    console.error("❌ Error sending password reset email:", error.message);
    return null;
  }
}

module.exports = { sendResetPasswordEmail };
