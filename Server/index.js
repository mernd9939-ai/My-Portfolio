require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sgMail = require('@sendgrid/mail');
const twilio = require('twilio');

const app = express();
app.use(cors());
app.use(express.json());

// ================= SETUP SENDGRID =====================
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// ================= EMAIL ROUTE ========================
app.post('/send-email', async (req, res) => {
  const { name, email, phone, company } = req.body;

  try {
    const msg = {
      to: process.env.MAIL_USER,        // Your email (receiver)
      from: process.env.MAIL_USER,      // Must be verified in SendGrid
      subject: 'New Contact Request',
      text: `
        Name: ${name}
        Email: ${email}
        Phone: ${phone}
        Company: ${company}
      `
    };

    await sgMail.send(msg);
    // console.log("hit")

    res.json({ success: true, message: "Email sent via SendGrid" });
  } catch (err) {
    // console.log("SENDGRID ERROR:", err.response?.body || err);
    res.status(500).json({ success: false, error: err.toString() });
  }
});

// ================= OTP ROUTE ===========================
app.post('/send-otp', async (req, res) => {
  const { phone } = req.body;

  if (phone !== "6367162245") {
    return res.json({ success: false, message: "Not allowed" });
  }

  const otp = Math.floor(1000 + Math.random() * 9000).toString();

  try {
    const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

    await client.messages.create({
      body: `Your OTP for admin login is: ${otp}`,
      from: process.env.TWILIO_PHONE,
      to: `+91${phone}`
    });

    res.json({ success: true, message: "OTP sent successfully", otp });
  } catch (err) {
    res.status(500).json({ success: false, message: err.toString() });
  }
});

// =======================================================
app.listen(5000, () => console.log("Server running on PORT 5000"));
