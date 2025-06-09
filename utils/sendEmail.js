import nodemailer from 'nodemailer';
import dotenv from 'dotenv'

dotenv.config();

export const sendMail = async ({ to, subject, text }) => {
  if (!to) throw new Error("Recipient email address is required.");
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.PASS_EMAIL,
        pass: process.env.PASS_KEY,
      },
    });

    const mailOptions = {
      from: `process.env.PASS_EMAIL`,
      to:to,
      subject: subject,
      text:text,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.error('Error sending email:', error.message);
    throw new Error('Failed to send email');
  }
};

export default sendMail
  
