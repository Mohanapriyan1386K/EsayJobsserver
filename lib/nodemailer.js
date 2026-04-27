import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendVerificationMail = async (userEmail, token) => {
  await resend.emails.send({
    from: 'onboarding@resend.dev',
    to: userEmail, // ✅ dynamic email
    subject: 'Verify Your Email',
    html: `
      <p>Click below to verify your email:</p>
      <a href="${process.env.VITE_FRONTEND_URL}/verify?token=${token}">
        Verify Email
      </a>
    `
  });
};