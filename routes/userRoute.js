// server/routes/userRoute.js

const express = require("express");
const router = express.Router();

// 1️⃣ Import your auth middleware
const { jwtAuth } = require("../middlewares/jwtAuth");

// 2️⃣ Import all controllers
const { signup }      = require("../controllers/userController/signupController");
const { login }       = require("../controllers/userController/loginController");
const { get }         = require("../controllers/userController/getController");
const { getAll }      = require("../controllers/userController/getAllController");
const { edit }        = require("../controllers/userController/editController");
const { remove }      = require("../controllers/userController/deleteController");
const { verify }      = require("../controllers/userController/otpController");
const { getByToken }  = require("../controllers/userController/getByTokenController");
const { getPending }  = require("../controllers/userController/getPendingController");

// 3️⃣ Public routes
router.post("/signup", signup);              // User Signup
router.post("/signup/verify", verify);       // OTP Verification
router.post("/login", login);                // User Login
router.post("/get", get);                    // Get User By ID (body)

// 4️⃣ Protected routes (require JWT)
router.get("/get", jwtAuth, getByToken);     // Get User By Token
router.get("/getPending", jwtAuth, getPending);   // Admin: Get unverified alumni
router.get("/getAll", jwtAuth, getAll);      // Admin: Get all users
router.put("/edit", jwtAuth, edit);          // Edit user (approve, profile update, etc.)
router.post("/delete", jwtAuth, remove);     // Delete user

module.exports = router;
