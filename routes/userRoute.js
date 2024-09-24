const express = require('express');
const { loginController, registerController, resetPasswordController, checkEmailController } = require('../controllers/userController');

const router = express.Router();


router.post("/register", registerController);
router.post("/login", loginController);
router.post("/check-email", checkEmailController); // Check if email exists
router.post("/reset-password/confirm", resetPasswordController); // Confirm password reset

module.exports = router;
