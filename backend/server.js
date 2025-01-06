const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const validator = require('validator'); // For email validation
require('dotenv').config(); 
const rateLimit = require('express-rate-limit');
const fs = require('fs');
const path = require('path');
const handlebars = require('handlebars');

const app = express();
const PORT = process.env.PORT || 3001;

// In-memory store for verification codes
const verificationCodes = {};

// Middleware
app.use(cors({
    origin: 'https://clamare.store', // Replace this with your frontend domain
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true, // If you're using cookies or HTTP authentication
}));

app.options('*', cors());


// Root route for testing
app.get('/', (req, res) => {
  res.send('hello from clamáre backend :)');
});

app.post('/api/contact', async (req, res) => {
  const { firstName, lastName, email, message, reason } = req.body;

  // Validate the form data
  if (!firstName || !lastName || !email || !message || !reason) {
    return res.status(400).json({
      success: false,
      message: 'All fields are required. Please fill out the entire form.',
    });
  }

  // Validate email format
  if (!validator.isEmail(email)) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a valid email address.',
    });
  }

  // Log the form data (you can also save this to a database)
  console.log('Form data received:', { firstName, lastName, email, message, reason });

  // Read the HTML template
  const templatePath = path.join(__dirname, 'supportConfirmationEmailTemplate.html'); // Ensure this path is correct
  let source;
  try {
    source = fs.readFileSync(templatePath, 'utf8');
  } catch (err) {
    console.error('Error reading email template:', err);
    return res.status(500).json({ success: false, message: 'Internal Server Error.' });
  }
  const template = handlebars.compile(source);

  // Define dynamic data
  const replacements = {
    firstName: firstName,
    reason: reason,
    message: message,
    // If using external logo
    logoUrl: 'https://yourdomain.com/path-to-logo.png', // Replace with your logo URL
    // If embedding logo, no need for logoUrl
    supportPageUrl: 'https://clamare.store/support',
  };

  const htmlToSend = template(replacements);

  // Set up Nodemailer transporter using Zoho SMTP settings from environment variables
  let transporter;
  try {
    transporter = nodemailer.createTransport({
      host: 'smtp.zoho.com',
      port: 587, // 587 for TLS, 465 for SSL
      secure: false, // true for port 465, false for port 587
      requireTLS: true, // Force TLS
      auth: {
        user: process.env.EMAIL_USER, // Your Zoho email address from .env
        pass: process.env.EMAIL_PASS, // Your Zoho password or App Password from .env
      },
      // Optional: Enable debugging
      // debug: true,
      // logger: true,
    });

    // Verify transporter configuration
    await transporter.verify();
    console.log('Nodemailer transporter is configured correctly for contact.');
  } catch (error) {
    console.error('Error configuring transporter:', error);
    return res.status(500).json({ success: false, message: 'Server configuration error.' });
  }

  const mailOptions = {
    from: `"Clamáre Support" <${process.env.EMAIL_USER}>`,
    to: email, // Receiver's email
    subject: 'We Have Received Your Message',
    html: htmlToSend,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Confirmation email sent to:', email);

    res.json({
      success: true,
      message: 'Form submitted successfully! A confirmation email has been sent to you.',
    });
  } catch (error) {
    console.error('Error sending confirmation email:', error);

    // Determine the type of error and respond accordingly
    if (error.code === 'EAUTH') {
      return res.status(500).json({
        success: false,
        message: 'Authentication failed. Please check your email credentials.',
      });
    } else {
      return res.status(500).json({
        success: false,
        message: 'Failed to send confirmation email.',
      });
    }
  }
});

// Start the Server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

app.post('/api/verification', async (req, res) => {
    console.log('Received /api/verification request:', req.body);
    const { code, firstName, email } = req.body;
  
    // Basic validation
    if (!code || !firstName || !email) {
      return res.status(400).json({
        success: false,
        message: 'Code, first name, and email are required.',
      });
    }
  
    // Validate email format
    if (!validator.isEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address.',
      });
    }
  
    // Store the verification code
    verificationCodes[email] = code;
    console.log(`Stored verification code for ${email}: ${code}`);
  
    // Read the HTML template
    const templatePath = path.join(__dirname, 'verificationCodeEmailTemplate.html');
    let source;
    try {
      source = fs.readFileSync(templatePath, 'utf8');
    } catch (err) {
      console.error('Error reading email template:', err);
      return res.status(500).json({ success: false, message: 'Internal Server Error.' });
    }
    const template = handlebars.compile(source);
  
    // Define dynamic data
    const replacements = {
      firstName: firstName,
      code: code,
    };
  
    const htmlToSend = template(replacements);
  
    // Set up Nodemailer transporter using Zoho SMTP settings from environment variables
    let transporter;
    try {
      transporter = nodemailer.createTransport({
        host: 'smtp.zoho.com',
        port: 587, // 587 for TLS, 465 for SSL
        secure: false, // true for port 465, false for port 587
        requireTLS: true, // Force TLS
        auth: {
          user: process.env.EMAIL_USER, // Your Zoho email address from .env
          pass: process.env.EMAIL_PASS, // Your Zoho password or App Password from .env
        },
      });
  
      // Verify transporter configuration
      await transporter.verify();
      console.log('Nodemailer transporter is configured correctly.');
    } catch (error) {
      console.error('Error configuring transporter:', error);
      return res.status(500).json({ success: false, message: 'Server configuration error.' });
    }
  
    const mailOptions = {
      from: `"Clamáre" <${process.env.EMAIL_USER}>`,
      to: email, // Receiver's email
      subject: "Verify it's you",
      html: htmlToSend,
    };
  
    try {
      await transporter.sendMail(mailOptions);
      console.log('Verification email sent to:', email);
  
      res.json({
        success: true,
        message: 'Verification email sent successfully.',
      });
    } catch (error) {
      console.error('Error sending verification email:', error);
  
      // Remove the stored code if email fails to send
      delete verificationCodes[email];
  
      // Determine the type of error and respond accordingly
      if (error.code === 'EAUTH') {
        return res.status(500).json({
          success: false,
          message: 'Authentication failed. Please check your email credentials.',
        });
      } else {
        return res.status(500).json({
          success: false,
          message: 'Failed to send verification email.',
        });
      }
    }
  });