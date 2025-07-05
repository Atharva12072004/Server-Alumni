const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const userModel = require('../../models/userSchema');
const otpModel  = require('../../models/otpSchema');

const verify = async (req, res) => {
  const { email, otpAttempt, rank, name, password, linkedinURL } = req.body;

  // 1. Fetch OTP record
  const otpRecord = await otpModel.findOne({ email });
  if (!otpRecord) {
    return res.status(404).json({ msg: "OTP Expired or Wrong E-Mail." });
  }
  console.log('OTP in DB:', otpRecord.otp, 'OTP Attempt:', otpAttempt);
  if (otpRecord.otp !== otpAttempt) {
    await otpModel.deleteOne({ email });
    return res.status(401).json({ msg: "Incorrect OTP." });
  }
  // Consume the OTP
  await otpModel.deleteOne({ email });

  // 2. For students, enforce only lowercase letters/digits + @acpce.ac.in
  if (rank === 2) {
    const studentEmailRegex = /^[a-z0-9]+@acpce\.ac\.in$/;
    if (!studentEmailRegex.test(email)) {
      return res.status(400).json({ msg: "Invalid College Email ID." });
    }
  }

  // 3. Hash password & build user payload
  bcrypt.hash(password, 8, async (err, hash) => {
    if (err) {
      console.error('Error hashing password:', err);
      return res.status(500).json({ msg: "Error Hashing Password", error: err });
    }

    try {
      // Core fields for all ranks
      let newUserData = {
        name,
        email,
        password: hash,
        rank,
      };

      // Extra fields for alumni (rank 1)
      if (rank === 1) {
        newUserData.linkedinURL = linkedinURL;
        newUserData.verificationStatus = 0;
      }

      // Student (rank 2) and outsider (rank 3) use only the core fields

      // 4. Create user record
      const created = await userModel.create(newUserData);

      // 5. Sign JWT
      if (!process.env.JWT_SECRET) {
        console.error('JWT_SECRET is not set in environment variables!');
        return res.status(500).json({ msg: 'Internal Server Error: JWT_SECRET not set in backend.' });
      }
      const token = jwt.sign(
        { email, rank, userID: created._id },
        process.env.JWT_SECRET,
        { expiresIn: "4d" }
      );

      // 6. Success message per rank
      const successMsg = 
        rank === 0
          ? "Admin Created Successfully"
          : rank === 1
          ? "Account Info Sent to Admin. Wait for Verification."
          : "User Created Successfully";

      return res.status(201).json({ msg: successMsg, token });
    } catch (createErr) {
      console.error('User creation or JWT error:', createErr);
      // Duplicate email
      if (createErr.code === 11000 && createErr.keyPattern?.email) {
        return res.status(409).json({ msg: "Email already exists." });
      }
      // Validation error
      if (createErr.name === "ValidationError") {
        return res.status(422).json({ msg: createErr.message });
      }
      // Other errors
      return res.status(500).json({ msg: "Internal Server Error", error: createErr });
    }
  });
};

module.exports = { verify };
