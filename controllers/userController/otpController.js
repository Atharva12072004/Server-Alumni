const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const userModel = require('../../models/userSchema');
const otpModel = require('../../models/otpSchema');

const verify = async (req, res) => {
  const { email, otpAttempt, rank, name, password, linkedinURL } = req.body;

  try {
    // 1. Fetch OTP record
    const otpRecord = await otpModel.findOne({ email });
    if (!otpRecord) {
      return res.status(404).json({ msg: "OTP Expired or Wrong E-Mail." });
    }

    // 2. Match OTP
    if (otpRecord.otp !== otpAttempt) {
      await otpModel.deleteOne({ email });
      return res.status(401).json({ msg: "Incorrect OTP." });
    }

    // 3. Consume OTP
    await otpModel.deleteOne({ email });

    // 4. Validate student email format if rank == 2
    if (rank === 2) {
      const studentEmailRegex = /^[a-z0-9]+@acpce\.ac\.in$/;
      if (!studentEmailRegex.test(email)) {
        return res.status(400).json({ msg: "Invalid College Email ID." });
      }
    }

    // 5. Hash the password
    const hash = await bcrypt.hash(password, 8);

    // 6. Prepare user object
    let newUserData = { name, email, password: hash, rank };

    if (rank === 1) {
      newUserData.linkedinURL = linkedinURL;
      newUserData.verificationStatus = 0;
    }

    // 7. Create the user
    const created = await userModel.create(newUserData);

    // 8. Generate JWT token
    const token = jwt.sign(
      { email, rank, userID: created._id },
      process.env.JWT_SECRET || process.env.jwtPassword || "defaultSecret",
      { expiresIn: "4d" }
    );

    // 9. Final Response Message
    const successMsg =
      rank === 0
        ? "Admin Created Successfully"
        : rank === 1
        ? "Account Info Sent to Admin. Wait for Verification."
        : "User Created Successfully";

    return res.status(201).json({ msg: successMsg, token });

  } catch (err) {
    console.error("❌ Error in verify():", err);

    // Duplicate email
    if (err.code === 11000 && err.keyPattern?.email) {
      return res.status(409).json({ msg: "Email already exists." });
    }

    // Validation error
    if (err.name === "ValidationError") {
      return res.status(422).json({ msg: err.message });
    }

    // Fallback
    return res.status(500).json({ msg: "Internal Server Error", error: err.message });
  }
};

module.exports = { verify };
