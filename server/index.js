const express = require('express');
const cors = require('cors');
const multer = require('multer');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json()); // Optional, for parsing application/json

// Configure Multer for processing multipart/form-data
// Using memoryStorage to keep the PDF blob in memory instead of writing to disk
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.get('/', (req, res) => {
  res.send('PDF Emailer Backend is running!');
});

// Endpoint to handle PDF upload and email sending
app.post('/api/send-pdf', upload.array('pdfs'), async (req, res) => {
  try {
    const files = req.files;
    const { userName, userContact, userEmail } = req.body;
    
    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No PDF files uploaded.' });
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const attachments = files.map((file) => ({
      filename: file.originalname, // Use original name passed from frontend
      content: file.buffer,
      contentType: 'application/pdf',
    }));

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: 'maheshmarvel009@gmail.com',
      subject: `Export from ${userName || 'User'} (${files.length} Designs)`,
      html: `
        <div style="font-family: sans-serif; line-height: 1.6; color: #333;">
          <h2 style="color: #10b981;">New Design Export Received</h2>
          <p>A user has exported their designs from LeafedIndia Studio.</p>
          <div style="background: #f8fafc; padding: 20px; border-radius: 10px; margin: 20px 0;">
            <h3 style="margin-top: 0;">User Details:</h3>
            <p><strong>Name:</strong> ${userName || 'N/A'}</p>
            <p><strong>Contact:</strong> ${userContact || 'N/A'}</p>
            <p><strong>Email:</strong> ${userEmail || 'N/A'}</p>
          </div>
          <p>Total Attachments: <strong>${files.length}</strong></p>
          <p>Find the exported PDFs attached to this email.</p>
        </div>
      `,
      attachments: attachments,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email sent from ${userName} with ${files.length} attachments!`);
    res.status(200).json({ message: 'Email sent successfully!' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ error: 'Failed to send email. Check server logs.' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
