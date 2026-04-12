const express = require('express');
const cors = require('cors');
const multer = require('multer');
const nodemailer = require('nodemailer');
const dns = require('dns');
require('dotenv').config();

// Force IPv4 as some cloud environments (like Render) have issues with IPv6 to Gmail
// This single line is the "magic" fix for the ENETUNREACH error you were seeing.
dns.setDefaultResultOrder('ipv4first');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json()); // Optional, for parsing application/json

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Create mail transporter once
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // Use STARTTLS for port 587
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  connectionTimeout: 60000, // 60 seconds
  greetingTimeout: 60000,
  socketTimeout: 60000,
  // FORCE IPv4 ONLY - This is the "Nuclear Option" to fix the ENETUNREACH error
  lookup: (hostname, options, callback) => {
    return dns.lookup(hostname, { family: 4 }, callback);
  },
});

app.get('/', (req, res) => {
  res.send('PDF Emailer Backend is running!');
});

// Endpoint to handle PDF upload and email sending
app.post('/api/send-pdf', upload.array('pdfs'), async (req, res) => {
  try {
    const files = req.files;
    const { userName, userContact, userEmail, uniqueKey } = req.body;

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
      cc: "codactask@gmail.com",
      subject: `INQUIRY-ID: ${uniqueKey} `,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f0fdf4; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.05); border: 1px solid #dcfce7; }
            .header { background: linear-gradient(135deg, #0d6e41, #10b981); padding: 40px 20px; text-align: center; color: white; }
            .logo-placeholder { font-size: 32px; font-weight: 800; letter-spacing: -1px; margin-bottom: 5px; }
            .logo-placeholder span { color: #fb923c; }
            .header-subtitle { font-size: 14px; opacity: 0.9; font-weight: 500; }
            .content { padding: 40px; }
            .title { color: #0d6e41; font-size: 24px; font-weight: 800; margin: 0 0 20px 0; border-bottom: 2px solid #f0fdf4; padding-bottom: 10px; }
            .details-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            .details-table th { text-align: left; padding: 12px; background-color: #f8fafc; color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; border-radius: 8px 0 0 8px; }
            .details-table td { text-align: left; padding: 12px; color: #1e293b; font-weight: 600; border-bottom: 1px solid #f1f5f9; }
            .status-badge { display: inline-block; padding: 4px 12px; background: #dcfce7; color: #166534; border-radius: 99px; font-size: 12px; font-weight: 700; }
            .key-section { background: #f8fafc; padding: 25px; border-radius: 12px; margin-top: 30px; text-align: center; border: 1px dashed #cbd5e1; }
            .key-label { color: #64748b; font-size: 13px; margin-bottom: 8px; font-weight: 500; }
            .key-value { color: #0d6e41; font-size: 20px; font-weight: 800; font-family: 'Courier New', Courier, monospace; letter-spacing: 2px; }
            .footer { background: #f8fafc; padding: 20px; text-align: center; color: #94a3b8; font-size: 12px; border-top: 1px solid #f1f5f9; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo-placeholder">LeafedIndia<span>.</span> STUDIO</div>
              <div class="header-subtitle">Creative Packaging Design</div>
            </div>
            <div class="content">
              <h2 class="title">Inquiry Details</h2>
              <p style="color: #64748b; font-size: 15px; line-height: 1.6;">Hello Team, a new design inquiry has been triggered. Below are the requester's details and the design reference.</p>
              
              <table class="details-table">
                <tr>
                  <th width="35%">Customer Name</th>
                  <td>${userName || 'N/A'}</td>
                </tr>
                <tr>
                  <th>Email Address</th>
                  <td><a href="mailto:${userEmail}" style="color: #10b981; text-decoration: none;">${userEmail || 'N/A'}</a></td>
                </tr>
                <tr>
                  <th>Contact No.</th>
                  <td>${userContact || 'N/A'}</td>
                </tr>
                <tr>
                  <th>PDF Count</th>
                  <td><span class="status-badge">${files.length} PDF(s)</span></td>
                </tr>
              </table>

              <div class="key-section">
                <div class="key-label">UNIQUE DESIGN REFERENCE KEY</div>
                <div class="key-value">${uniqueKey || 'N/A'}</div>
              </div>
            </div>
            <div class="footer">
              This is an automated export from LeafedIndia Studio.<br>
              &copy; 2026 LeafedIndia. All rights reserved.
            </div>
          </div>
        </body>
        </html>
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
