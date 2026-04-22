import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY ?? ''); // Ensure you have the API key in your environment variables

export default async function sendEmail(
  clientEmail: string,
  emailSubject: string,
  emailText: string,
  emailHtml: string,
) {
  const msg = {
    to: clientEmail, // Change to your recipient
    from: process.env.SENDGRID_FROM_EMAIL ?? '', // Change to your verified sender
    subject: emailSubject,
    text: emailText,
    html: emailHtml,
  };

  try {
    await sgMail.send(msg);
    console.log('Email sent successfully');
  } catch (error) {
    console.error(error);
  }
}
