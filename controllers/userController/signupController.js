const nodemailer = require("nodemailer");
const otpGenerator = require('otp-generator');
const userModel = require('../../models/userSchema');
const otpModel = require('../../models/otpSchema');

// ✅ Brevo-compatible transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

const signup = async (req, res) => {
  const { email } = req.body;
  const user = await userModel.findOne({ email });
  if (user) {
    return res.status(409).json({ msg: "User Already Exists." });
  }
  const otpStatus = await generateAndSendOtp(email);
  if (!otpStatus) {
    return res.status(500).json({ msg: "Error Generating And Sending OTP." });
  }
  return res.status(200).json({ msg: "OTP Sent Successfully." });
}

const generateAndSendOtp = async (email) => {
  try {
    const otp = otpGenerator.generate(6, {
      digits: true, lowerCaseAlphabets: false, upperCaseAlphabets: false, specialChars: false
    });
    await otpModel.create({ email, otp });

    const mailOptions = {
      from: `"AlmaMatter" <${process.env.SENDER_EMAIL}>`,
      to: email,
      subject: "Your OTP for AlmaMatter Verification",
      html: `...${otp}...` // use your HTML here
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ E-Mail sent:", info.messageId);
    return 1;
  } catch (err) {
    console.error("❌ Email Error:", err.message);
    return 0;
  }
};

module.exports = { signup };
