// server/controllers/userController/otpController.js
const nodemailer    = require("nodemailer");
const otpGenerator  = require("otp-generator");
const userModel     = require("../../models/userSchema");
const otpModel      = require("../../models/otpSchema");

// ─── Create a reusable Brevo SMTP transporter ───────────────────────
const transporter = nodemailer.createTransport({
  host:    process.env.SMTP_HOST,               // smtp-relay.brevo.com
  port:    parseInt(process.env.SMTP_PORT),     // 587
  secure:  false,                               // TLS over 587
  auth: {
    user: process.env.SMTP_USER,                // 87c32c001@smtp-brevo.com
    pass: process.env.SMTP_PASS                 // your Brevo SMTP key
  }
});

// Optional: verify connection on startup
transporter.verify((err, success) => {
  if (err) {
    console.error("❌ Brevo SMTP verify failed:", err);
  } else {
    console.log("✅ Brevo SMTP is ready to send messages");
  }
});

const signup = async (req, res) => {
  const { email } = req.body;
  try {
    // 1) Prevent duplicate OTP entries
    await otpModel.deleteOne({ email });

    // 2) Check if user already exists
    if (await userModel.findOne({ email })) {
      return res.status(409).json({ msg: "User Already Exists." });
    }

    // 3) Generate & send OTP
    const sent = await generateAndSendOtp(email);
    if (!sent) {
      return res.status(500).json({ msg: "Error Generating And Sending OTP." });
    }
    return res.status(200).json({ msg: "OTP Sent Successfully." });
  } catch (err) {
    console.error("signup controller error:", err);
    return res.status(500).json({ msg: "Internal Server Error." });
  }
};

const generateAndSendOtp = async (email) => {
  try {
    const otp = otpGenerator.generate(6, {
      digits: true,
      lowerCaseAlphabets: false,
      upperCaseAlphabets: false,
      specialChars: false
    });
    // Save OTP (old one was already deleted above)
    await otpModel.create({ email, otp });

    // Build email HTML
    const year = new Date().getFullYear();
    const html = `
      <div style="font-family: Arial,sans-serif; max-width:600px; margin:0 auto; padding:20px; background:#f9f9f9; border-radius:8px;">
        <div style="text-align:center; margin-bottom:20px;">
          <img src="https://i.imgur.com/7FjkA5D.png" alt="AlmaMatter Logo" style="width:150px;"/>
        </div>
        <h2 style="color:#333;">Dear User,</h2>
        <p style="color:#555; line-height:1.6;">
          Thank you for choosing <strong>AlmaMatter</strong>! Your OTP is:
        </p>
        <div style="text-align:center; margin:20px 0;">
          <span style="display:inline-block; background:#fff; color:#1a73e8; font-size:24px; padding:10px 20px; border-radius:5px;">
            ${otp}
          </span>
        </div>
        <p style="color:#555; line-height:1.6;">
          This OTP expires in 5 minutes. Do not share with anyone.
        </p>
        <p style="color:#555; line-height:1.6;">
          If you did not request this, please ignore.
        </p>
        <p style="margin-top:30px; color:#333;">
          Regards,<br/>The AlmaMatter Team
        </p>
        <hr style="border:none; border-top:1px solid #ddd; margin:30px 0;"/>
        <footer style="text-align:center; color:#777; font-size:12px;">
          &copy; ${year} AlmaMatter. All rights reserved.<br/>IIIT Dharwad, Karnataka
        </footer>
      </div>
    `;

    // Send mail
    const info = await transporter.sendMail({
      from: `"AlmaMatter" <${process.env.SENDER_EMAIL}>`,
      to: email,
      subject: "Your OTP for AlmaMatter Verification",
      html
    });

    console.log("✅ OTP email sent:", info.messageId);
    return true;
  } catch (err) {
    console.error("❌ generateAndSendOtp error:", err);
    return false;
  }
};

module.exports = { signup };
