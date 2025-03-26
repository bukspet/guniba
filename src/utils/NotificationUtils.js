const nodemailer = require("nodemailer");

exports.sendEmail = async (email, subject, message) => {
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: "oluwabukunmiadeyemo99@gmail.com",
      pass: "FIDO:/392415791446754946424485685299006162985193590358551311692027045495700058438140306648259190676520290592614421184560184490070437895440186112420866761163522109321447142660",
    },
  });

  await transporter.sendMail({
    from: "guniba@gmail.com",
    to: email,
    subject,
    text: message,
  });
};

exports.sendSMS = async (phone, message) => {
  console.log(`Sending SMS to ${phone}: ${message}`);
};
