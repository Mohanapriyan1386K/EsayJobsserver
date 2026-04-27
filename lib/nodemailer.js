require("dotenv").config();
const nodemailer = require("nodemailer");

const SMTP_USER = String(process.env.EMAIL || "").trim();
const SMTP_PASS = String(process.env.PASS || "").replace(/\s+/g, "").trim();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS,
  },
});

const sendVerificationMail = async (to, token, subject = "Verify Your Email") => {
  if (!SMTP_USER || !SMTP_PASS) {
    throw new Error("Mail config missing: set EMAIL and PASS in .env");
  }

  const frontendUrl = (process.env.VITE_FRONTEND_URL || "http://localhost:5173").replace(/\/+$/, "");
  const verifyLink = `${frontendUrl}/verify-email?token=${token}`;

  await transporter.sendMail({
    from: SMTP_USER,
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
