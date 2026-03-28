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
app.post('/api/send-pdf', upload.single('pdf'), async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: 'No PDF file uploaded.' });
    }

    // Configure Nodemailer transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail', // You can explicitly specify smtp.gmail.com if service name fails in some regions
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Setup email data
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: 'maheshmarvel009@gmail.com', // Sending to yourself
      subject: 'New Template Exported',
      text: 'A user has just exported a new design template. Find it attached.',
      attachments: [
        {
          filename: 'design.pdf',
          content: file.buffer, // The buffer from multer's memory storage
          contentType: 'application/pdf',
        },
      ],
    };

    // Send email
    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully!');
    
    res.status(200).json({ message: 'Email sent successfully!' });

  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ error: 'Failed to send email. Check server logs.' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
