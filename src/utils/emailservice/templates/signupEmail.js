const { sendEmail } = require("../emailService");

async function sendSignupEmail(email, fullName, referralCode) {
  try {
    const sender = "Guniba <postmaster@mail.guniba.net>";
    const subject = "Welcome to Guniba";

    const messageTemplate = () => `
      <p>Hello <b>${fullName}</b>,</p>
      <p>Welcome to <b>Guniba</b>!  We're excited to have you on board.</p>
      
      <p>Your account has been created successfully. You can now start exploring our platform, shopping for your favorite items, and sharing your referral code with friends to earn rewards.</p>

      <p style="
        margin: 15px 0;
        background-color: #f3f4f6;
        color: #111827;
        padding: 12px 20px;
        display: inline-block;
        border-radius: 8px;
        font-weight: bold;
        font-size: 1.1em;
        letter-spacing: 1px;
      ">
        Your Referral Code: ${referralCode}
      </p>

      <p>Use this code to invite friends and earn special rewards when they join Guniba.</p>

      <p>Thank you for joining us, and we look forward to serving you.</p>
      <p>— The Guniba Team</p>
    `;

    const emailSent = await sendEmail({
      sender,
      recipient: email,
      subject,
      messageTemplate,
    });

    if (!emailSent || emailSent.message !== "Queued. Thank you.") {
      console.error("❌ Failed to send signup email for:", email, emailSent);
      return null;
    }

    return emailSent;
  } catch (error) {
    console.error("❌ Error sending signup email:", error.message);
    return null;
  }
}

module.exports = { sendSignupEmail };
