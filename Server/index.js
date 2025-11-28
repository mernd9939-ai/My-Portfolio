require('dotenv').config();
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const twilio = require('twilio');

const app = express();
app.use(cors());
app.use(express.json());

// ================= EMAIL ROUTE =====================
app.post('/send-email', async (req, res) => {
  const { name, email, phone, company } = req.body;

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS
      }
    });

    await transporter.verify();

    const mailOptions = {
      from: process.env.MAIL_USER,
      to: process.env.MAIL_USER,
      subject: 'New Contact Request',
      text: `
        Name: ${name}
        Email: ${email}
        Phone: ${phone}
        Company: ${company}
      `
    };

    const info = await transporter.sendMail(mailOptions);
    res.json({ success: true, message: "Email sent", info });

  } catch (err) {
    res.status(500).json({ success: false, error: err.toString() });
  }
});

// ================ OTP SENDING ========================
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
      from: process.env.TWILIO_PHONE, // your Twilio number
      to: `+91${phone}`
    });

    res.json({ success: true, message: "OTP sent successfully", otp }); // you can omit sending OTP in response for security
  } catch (err) {
    res.status(500).json({ success: false, message: err.toString() });
  }
});

// =====================================================
app.listen(5000, () => console.log("Server running on PORT 5000"));
