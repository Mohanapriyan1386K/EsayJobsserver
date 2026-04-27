const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASS,
  },
});

const sendVerificationMail = async (to, token, subject = "Verify Your Email") => {
  const frontendUrl = (process.env.VITE_FRONTEND_URL || "http://localhost:5173").replace(/\/+$/, "");
  const verifyLink = `${frontendUrl}/verify-email?token=${token}`;

  await transporter.sendMail({
    from: process.env.EMAIL,
    to,
    subject,
    html: `
      <h2>Email Verification</h2>
      <p>Click below to verify your account:</p>
      <a href="${verifyLink}">Verify Email</a>
    `,
  });
};

module.exports = {
  sendVerificationMail,
};
