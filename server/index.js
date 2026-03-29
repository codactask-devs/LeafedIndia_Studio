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

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Create mail transporter once
// Create mail transporter with pooling for speed
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, // Use SSL
  pool: true, // Reuse connections
  maxConnections: 5,
  maxMessages: 100,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

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


    // Attachments will now use the pre-created transporter

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

    // Fire-and-forget sending (Background processing)
    transporter.sendMail(mailOptions)
      .then(() => {
        console.log(`Email sent successfully from ${userName} with ${files.length} attachments.`);
      })
      .catch((error) => {
        console.error('Background Error sending email:', error);
        const fs = require('fs');
        const logEntry = `[${new Date().toISOString()}] Background Error: ${error.message}\n`;
        fs.appendFileSync('error.log', logEntry);
      });

    // Respond to user immediately so they don't wait for Gmail
    res.status(200).json({ 
      message: 'Email sending process started! It will arrive in a few moments.' 
    });
  } catch (error) {
    console.error('Error sending email:', error);
    // Log error to a file with timestamp
    const fs = require('fs');
    const logMessage = `[${new Date().toISOString()}] Error sending email: ${error.message} - ${error.stack}\n`;
    fs.appendFileSync('error.log', logMessage);
    
    // Return detailed error message temporarily for debugging
    res.status(500).json({ 
      error: 'Failed to send email.',
      details: error.message,
      logs: 'Check server logs for full stack trace.'
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
