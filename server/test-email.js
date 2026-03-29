const nodemailer = require('nodemailer');
require('dotenv').config();

async function testEmail() {
  console.log('Testing email configuration...');
  console.log('EMAIL_USER:', process.env.EMAIL_USER);
  console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? '********' : 'NOT SET');

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  try {
    console.log('Verifying transporter...');
    await transporter.verify();
    console.log('Transporter is ready to take our messages!');

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: 'maheshmarvel009@gmail.com',
      subject: 'LeafedIndia Studio - Test Email',
      text: 'This is a test email from the LeafedIndia Studio backend.',
    };

    console.log('Sending test email...');
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully!');
    console.log('Message ID:', info.messageId);
  } catch (error) {
    console.error('Error during email test:', error);
  }
}

testEmail();
