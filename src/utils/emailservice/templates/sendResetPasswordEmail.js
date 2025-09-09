const { sendEmail } = require("../emailService");

async function sendResetPasswordEmail(email, resetCode) {
  try {
    const sender = "Guniba <postmaster@mail.guniba.net>";
    const subject = "Your Password Reset Code";

    const messageTemplate = () => `
      <p>Hello,</p>
      <p>You have requested to reset your password for your Guniba account.</p>
 <p style="
  font-size: 1.5em; 
  margin: 10px 0; 
  background-color: #f3f4f6; 
  color: #111827; 
  padding: 10px 20px; 
  display: inline-block; 
  border-radius: 8px; 
  font-weight: bold; 
  letter-spacing: 2px;
">
  ${resetCode}
</p>
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
