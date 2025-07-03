const express = require("express");
const router  = express.Router();

const { jwtAuth, alumniVerify } = require("../middlewares/jwtAuth");
const { signup }      = require("../controllers/userController/signupController");
const { verify }      = require("../controllers/userController/otpController");
const { login }       = require("../controllers/userController/loginController");
const { get }         = require("../controllers/userController/getController");
const { getByToken }  = require("../controllers/userController/getByTokenController");
const { getPending }  = require("../controllers/userController/getPendingController");
const { getAll }      = require("../controllers/userController/getAllController");
const { edit }        = require("../controllers/userController/editController");
const { remove }      = require("../controllers/userController/deleteController");

// Public
router.post("/signup",           signup);
router.post("/signup/verify",    verify);
router.post("/login",            login);
router.post("/get",              get);

// Protected
router.get( "/get",           jwtAuth,      getByToken);
router.get( "/getPending",    jwtAuth,      getPending);
router.get( "/getAll",        jwtAuth,      getAll);
router.put( "/edit",          jwtAuth,alumniVerify, edit);
router.post("/delete",        jwtAuth,      remove);

module.exports = router;
