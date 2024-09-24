const userModel = require('../models/userModel')
const nodemailer = require('nodemailer');



// Check if email exists
const checkEmailController = async (req, res) => {
    const { email } = req.body;
    console.log("check email controller method in userController");
    try {
        const user = await userModel.findOne({ email });
        if (user) {
            return res.json({ exists: true  });
        } else {
            return res.json({ exists: false });
        }
    } catch (error) {
        console.error('Error in checkEmailController:', error); // Log the error
        res.status(500).json({ message: 'Server error' });
    }
};


// Reset password
const resetPasswordController = async (req, res) => {
    const { email, newPassword } = req.body;
    try {
        console.log('Reset password request received:', { email, newPassword });
        const user = await userModel.findOne({ email });
        console.log(user);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Hash the new password before saving it
        //user.password = await bcrypt.hash(newPassword, 10);
        user.password = newPassword;
        await user.save();
        res.status(200).json({ message: 'Password reset successful' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};



//login callback
const loginController = async (req, res) => {
    try {
        console.log('Received login request');
        console.log('Request body:', req.body);

        const { email, password } = req.body;

        const user = await userModel.findOne({ email });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        // Ideally, use hashed passwords. For now, this works with plain-text
        if (user.password !== password) {
            return res.status(400).json({
                success: false,
                message: 'Incorrect password',
            });
        }

        res.status(200).json({
            success: true,
            user,
        });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during login',
        });
    }
};


const registerController = async (req, res) => {
    try {
        console.log('Incoming request body:', req.body);

        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields: name, email, and password',
            });
        }

        // Check if the user with this email already exists
        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User with this email already exists',
            });
        }

        const newUser = new userModel({ name, email, password });
        await newUser.save();
        res.status(201).json({
            success: true,
            newUser,
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};

module.exports = { loginController, registerController, checkEmailController, resetPasswordController };

