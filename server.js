const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors({ origin: '*'}));

// Serve static files (index.html, styles.css, script.js)
app.use(express.static(path.join(__dirname)));

// Health check
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// Contact endpoint
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body || {};

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ ok: false, error: 'Missing required fields' });
    }

    const toEmail = process.env.TO_EMAIL || 'akshaydwivedi707@gmail.com';

    // Configure transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const mailOptions = {
      from: `Portfolio Contact <${process.env.SMTP_USER}>`,
      to: toEmail,
      replyTo: email,
      subject: `[Portfolio] ${subject}`,
      text: `Name: ${name}\nEmail: ${email}\n\n${message}`,
      html: `
        <div style="font-family:Segoe UI,Arial,sans-serif;line-height:1.6;color:#111">
          <h2 style="margin:0 0 8px">New Portfolio Inquiry</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Subject:</strong> ${subject}</p>
          <hr style="border:none;border-top:1px solid #eee;margin:12px 0"/>
          <p style="white-space:pre-wrap">${message}</p>
        </div>
      `,
    };

    await transporter.verify();
    await transporter.sendMail(mailOptions);

    res.json({ ok: true });
  } catch (err) {
    console.error('Email send failed:', err);
    res.status(500).json({ ok: false, error: 'Failed to send email' });
  }
});

app.listen(PORT, () => {
  console.log(`Portfolio server running at http://localhost:${PORT}`);
});


