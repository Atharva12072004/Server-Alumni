// server/controllers/authController.js (or wherever your signup lives)
const nodemailer    = require("nodemailer");
const otpGenerator  = require('otp-generator');
const userModel     = require('../../models/userSchema');
const otpModel      = require('../../models/otpSchema');

// ── Brevo SMTP transporter ──────────────────────────
const transporter = nodemailer.createTransport({
  host:   process.env.SMTP_HOST,              // smtp-relay.brevo.com
  port:   parseInt(process.env.SMTP_PORT),    // 587
  secure: false,                              // TLS on 587
  auth: {
    user: process.env.SMTP_USER,              // 87c32c001@smtp-brevo.com
    pass: process.env.SMTP_PASS               // your Brevo SMTP key
  }
});

// ── Signup Handler ──────────────────────────────────
const signup = async (req, res) => {
  const { email } = req.body;
  try {
    // 1. Check existing
    if (await userModel.findOne({ email })) {
      return res.status(409).json({ msg: "User Already Exists." });
    }
    // 2. Generate & send OTP
    const sent = await generateAndSendOtp(email);
    if (!sent) {
      return res.status(500).json({ msg: "Error Generating And Sending OTP." });
    }
    return res.status(200).json({ msg: "OTP Sent Successfully." });
  } catch (err) {
    console.error("Signup Error:", err);
    return res.status(500).json({ msg: "Internal Server Error." });
  }
};

// ── OTP Generation & Email ─────────────────────────
const generateAndSendOtp = async (email) => {
  try {
    // 1. Create OTP record
    const otp = otpGenerator.generate(6, {
      digits: true, lowerCaseAlphabets: false,
      upperCaseAlphabets: false, specialChars: false
    });
    await otpModel.create({ email, otp });

    // 2. Prepare email HTML
    const html = `
      <div style="background-color: #000; padding: 30px; font-family: Arial, sans-serif; color: #fff;">
        <div style="max-width: 600px; margin: auto; background-color: #111; border-radius: 8px; padding: 30px;">
          
          <div style="text-align: center; margin-bottom: 30px;">
            <img src="https://ik.imagekit.io/hlivau4qk6/Certificates/Divine%20DevOps%20LOGO.png?updatedAt=1748940956904"
                 alt="ACPCE Alumni Logo"
                 style="width: 120px; border-radius: 8px;" />
          </div>
  
          <h2 style="color: #fff; margin-bottom: 10px;">Dear User,</h2>
  
          <p style="font-size: 15px; line-height: 1.6; color: #ccc;">
            Thank you for choosing <strong>ACPCE Alumni</strong>! Your OTP for verification is:
          </p>
  
          <div style="text-align: center; margin: 20px 0;">
            <div style="
              display: inline-block;
              background-color: #1f1f1f;
              color: #4fc3f7;
              font-size: 28px;
              padding: 14px 30px;
              border-radius: 6px;
              letter-spacing: 2px;
            ">
              ${otp}
            </div>
          </div>
  
          <p style="font-size: 14px; color: #bbb;">
            This OTP will expire in 5 minutes. Please do not share this code with anyone.
          </p>
  
          <p style="font-size: 14px; color: #888;">
            If you didn't request this, please ignore this email.
          </p>
  
          <p style="margin-top: 30px; color: #aaa;">
            Regards,<br/>
            <strong>The ACPCE Alumni Team</strong>
          </p>
  
          <hr style="border: none; border-top: 1px solid #333; margin: 40px 0;" />
  
          <footer style="text-align: center; font-size: 12px; color: #555;">
            &copy; 2025 ACPCE Alumni. All rights reserved.<br/>
            A. C. Patil College Of Engineering, Kharghar, Navi Mumbai.
          </footer>
        </div>
      </div>
    `;

    // 3. Send email
    await transporter.sendMail({
      from: `"ACPCE Alumni" <${process.env.SENDER_EMAIL}>`,
      to: email,
      subject: "Your OTP for ACPCE Alumni Verification",
      html
    });
    console.log("✅ OTP Email sent to", email);
    return true;
  } catch (err) {
    console.error("Email Error:", err);
    return false;
  }
};

module.exports = { signup };
