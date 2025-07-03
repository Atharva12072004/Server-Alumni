// server/controllers/userController/editController.js
const bcrypt    = require('bcrypt');
const userModel = require("../../models/userSchema");

const edit = async (req, res) => {
  const {
    userID,
    name,
    email,
    password,
    profilePicURL,
    githubURL,
    xURL,
    linkedinURL,
    jobLocation,
    companyName,
    position,
    floatedProjects,
    floatedJobs,
    offeredReferrals,
    notifications,
    verificationStatus
  } = req.body;

  try {
    // 1️⃣ Find the existing user by MongoDB _id
    const user = await userModel.findById(userID);
    if (!user) {
      return res.status(404).json({ msg: "User Not Found" });
    }

    // 2️⃣ Hash new password if provided, else keep old
    const hashedPassword = password
      ? await bcrypt.hash(password, 8)
      : user.password;

    // 3️⃣ Build update object
    const update = {
      name,
      email,
      password: hashedPassword,
      profilePicURL,
      githubURL,
      xURL,
      linkedinURL,
      jobLocation,
      companyName,
      position,
      verificationStatus,
      floatedProjects: floatedProjects
        ? user.floatedProjects.concat(
            Array.isArray(floatedProjects) ? floatedProjects : [floatedProjects]
          )
        : user.floatedProjects,
      floatedJobs: floatedJobs
        ? user.floatedJobs.concat(
            Array.isArray(floatedJobs) ? floatedJobs : [floatedJobs]
          )
        : user.floatedJobs,
      offeredReferrals: offeredReferrals
        ? user.offeredReferrals.concat(
            Array.isArray(offeredReferrals) ? offeredReferrals : [offeredReferrals]
          )
        : user.offeredReferrals,
      notifications: notifications
        ? user.notifications.concat(
            Array.isArray(notifications) ? notifications : [notifications]
          )
        : user.notifications
    };

    // 4️⃣ Perform the update
    const updatedUser = await userModel.findByIdAndUpdate(
      userID,
      update,
      { new: true }
    );

    // 5️⃣ Respond with the updated document
    return res.json({ msg: "User updated", user: updatedUser });
  } catch (err) {
    console.error("editController Error:", err);
    return res.status(500).json({
      msg: "An error occurred while updating the user",
      error: err.message
    });
  }
};

module.exports = { edit };

