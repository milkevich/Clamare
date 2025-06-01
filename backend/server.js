const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const validator = require('validator'); // For email validation
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const handlebars = require('handlebars');

const PORT = process.env.PORT || 3000;
const verificationCodes = {}

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.options('*', (req, res) => {
  res.set({
    'Access-Control-Allow-Origin': 'https://clamare.store',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Credentials': 'true',
  });
  res.sendStatus(200);
});


app.use(cors({
  origin: 'https://clamare.store',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));


app.use((req, res, next) => {
  console.log('CORS Headers:', res.getHeaders());
  next();
});

app.get('/', (req, res) => {
  res.send('hello from clamáre backend :)');
});

app.post('/api/contact', cors(), async (req, res) => {
  try {
      console.log('Incoming data:', req.body);

      const { firstName, lastName, email, message, reason } = req.body;

      // Validate input
      if (!firstName || !lastName || !email || !message || !reason) {
          return res.status(400).json({
              success: false,
              message: 'All fields are required. Please fill out the entire form.',
          });
      }
      if (!validator.isEmail(email)) {
          return res.status(400).json({
              success: false,
              message: 'Please provide a valid email address.',
          });
      }

      // Read the HTML template for the user
      const templatePath = path.join(__dirname, 'supportConfirmationEmailTemplate.html');
      let source;
      try {
          source = fs.readFileSync(templatePath, 'utf8');
      } catch (err) {
          console.error('Error reading email template:', err);
          return res.status(500).json({ success: false, message: 'Internal Server Error.' });
      }
      const template = handlebars.compile(source);

      // Define dynamic data for the user template
      const userReplacements = {
          firstName: firstName,
          reason: reason,
          message: message,
          logoUrl: 'https://yourdomain.com/path-to-logo.png', // Replace with your actual logo URL
          supportPageUrl: 'https://clamare.store/support',
      };
      const htmlToSendToUser = template(userReplacements);

      // Define plain text email for support
      const supportEmailContent = `
      New Support Request:
      --------------------------------------
      Name: ${firstName} ${lastName}
      Email: ${email}
      Reason: ${reason}
      Message:
      ${message}
      --------------------------------------
      `;

      // Set up Nodemailer transporter
      const transporter = nodemailer.createTransport({
          host: 'smtp.zoho.com',
          port: 587,
          secure: false, // Use TLS
          requireTLS: true,
          auth: {
              user: process.env.EMAIL_USER,
              pass: process.env.EMAIL_PASS,
          },
      });

      console.log('Transporter Verification:', await transporter.verify());

      // Prepare mail options for the user
      const mailOptionsUser = {
          from: `"Clamáre Support" <${process.env.EMAIL_USER}>`,
          to: email,
          subject: 'We Have Received Your Message',
          html: htmlToSendToUser,
      };

      // Prepare mail options for support
      const mailOptionsSupport = {
          from: `"Clamáre Website" <${process.env.EMAIL_USER}>`,
          to: 'support@clamare.store', // Support email address
          subject: 'New Support Request',
          text: supportEmailContent, // Plain text format
      };

      // Send both emails
      await Promise.all([
          transporter.sendMail(mailOptionsUser),
          transporter.sendMail(mailOptionsSupport),
      ]);

      console.log('Emails sent successfully.');

      res.json({
          success: true,
          message: 'Form submitted successfully! Confirmation email has been sent, and support has been notified.',
      });
  } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});


// Start the Server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

app.post('/api/verification', async (req, res) => {
  try {
    console.log('Received /api/verification request:', req.body);
    const { code, firstName, email } = req.body;

    if (!code || !firstName || !email) {
      return res.status(400).json({ success: false, message: 'Missing required fields.' });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({ success: false, message: 'Invalid email format.' });
    }

    verificationCodes[email] = code; // Store verification code

    const templatePath = path.join(__dirname, 'verificationCodeEmailTemplate.html');
    const source = fs.readFileSync(templatePath, 'utf8');
    const template = handlebars.compile(source);

    const htmlToSend = template({ firstName, code });

    const transporter = nodemailer.createTransport({
      host: 'smtp.zoho.com',
      port: 587,
      secure: false,
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });

    await transporter.verify();
    await transporter.sendMail({
      from: `"Clamáre" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Verify it\'s you',
      html: htmlToSend,
    });

    res.json({ success: true, message: 'Verification email sent.' });
  } catch (error) {
    console.error('Error in /api/verification:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});
