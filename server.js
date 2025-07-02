const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
const bodyParser = require("body-parser");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

// Set up Gmail SMTP transport
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // true for 465, false for other ports
  auth: {
    user: process.env.MCP_EMAIL,
    pass: process.env.MCP_EMAIL_PASSWORD,
  },
});

app.post("/appointment", async (req, res) => {
  const { email } = req.body;

 
  if (!email || typeof email !== "string") {
    return res.status(400).json({ error: "Invalid email address." });
  }

  // Email to MCP
  const notifyMCP = {
    from: `"MCP Advisory Bot" <${process.env.MCP_EMAIL}>`,
    to: process.env.MCP_EMAIL,
    subject: "📩 New Appointment Request",
    text: `You received a new appointment request from: ${email}`,
    html: `
         <p><strong>New Appointment Request</strong></p>
         <p>Email: <a href="mailto:${email}">${email}</a> want to schedule an appointment with you.</p>
         <p>Kindly confirm the appointment with the user.</p>
         <p>Best regards,<br /><strong>MCP Advisory Bot</strong></p>
         <p><a href="mailto:${email}">Reply to User</a></p>
         <p>Thank you for your attention!</p>
         <p>Best regards,<br /><strong>MCP Advisory Bot</strong></p>   
        `,
  };

  // Confirmation email to user
  const confirmUser = {
    from: `"MCP Advisory" <${process.env.MCP_EMAIL}>`,
    to: email,
    subject: "✅ Your Appointment Request Received",
    text: `Hi there,\n\nWe have received your appointment request. Our team will reach out shortly.\n\nBest,\nMCP Advisory`,
    html: `
      <p>Hi there,</p>
      <p>We have received your appointment request. Our team will be in touch shortly.</p>
      <p>Best regards,<br /><strong>MCP Advisory</strong></p>
    `,
  };

  try {
    // Send both emails in parallel
    await Promise.all([
      transporter.sendMail(notifyMCP),
      transporter.sendMail(confirmUser),
    ]);

    res.status(200).json({ message: "Emails sent successfully." });
  } catch (error) {
    console.error("Failed to send emails:", error);
    res.status(500).json({ error: "Failed to send emails." });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
});

