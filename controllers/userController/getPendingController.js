const userModel = require("../../models/userSchema");

const getPending = async (req, res) => {
  try {
    const users = await userModel.find({ verificationStatus: 0 });
    if (!users.length) {
      return res.status(404).json({ msg: "No pending users" });
    }
    return res.json(users);
  } catch (err) {
    console.error("getPending Error:", err);
    return res.status(500).json({ msg: "Internal Server Error" });
  }
};

module.exports = { getPending };
