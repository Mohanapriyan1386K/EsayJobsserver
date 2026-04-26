import { Resend } from 'resend';

const resend = new Resend('re_fYUnUBpK_76f8SHDNUMFRYfDgyA6UCJKz');

resend.emails.send({
  from: 'onboarding@resend.dev',
  to: 'mohanapriyan1386@gmail.com',
  subject: 'Hello World',
  html: '<p>Congrats on sending your <strong>first email</strong>!</p>'
});