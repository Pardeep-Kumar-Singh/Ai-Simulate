const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');

// @desc    Register a new user
// @route   POST /signup
// @access  Public
router.post('/signup', async (req, res) => {
    try {
        const { first_name, last_name, email, password } = req.body;

        // Check if user exists
        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ detail: 'Email already registered' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        // Note: The python app used 'first_name' in request but expected 'firstName' in DB? 
        // Actually python app: `UserSignup` had `first_name`, DB query: `firstName`.
        // Frontend sends `first_name`, `last_name`, `email`, `password`.

        const user = await User.create({
            firstName: first_name,
            lastName: last_name,
            email,
            password: hashedPassword,
        });

        if (user) {
            res.status(201).json({
                message: 'User created successfully',
            });
        } else {
            res.status(400).json({ detail: 'Invalid user data' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ detail: 'Server Error' });
    }
});

// @desc    Auth user & get token (Login)
// @route   POST /login
// @access  Public
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user by email
        const user = await User.findOne({ email });

        if (user && (await bcrypt.compare(password, user.password))) {
            res.json({
                message: 'Login successful',
                user: {
                    uid: user._id,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    role: user.email === 'admin' ? 'admin' : user.role || 'student',
                },
            });
        } else {
            res.status(401).json({ detail: 'Invalid email or password' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ detail: 'Server Error' });
    }
});

module.exports = router;
