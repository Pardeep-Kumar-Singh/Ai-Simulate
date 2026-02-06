const express = require('express');
const router = express.Router();
const User = require('../models/User');

// @desc    Get all users
// @route   GET /users
// @access  Public (or Protected later)
router.get('/', async (req, res) => {
    try {
        const users = await User.find({});

        // Format for frontend
        const formattedUsers = users.map(user => ({
            id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            timestamp: user.createdAt,
            role: user.role || 'student',
            contact: user.contact,
            address: user.address,
            jobRole: user.jobRole,
            status: user.status
        }));

        res.json(formattedUsers);
    } catch (error) {
        console.error(error);
        res.status(500).json({ detail: 'Server Error' });
    }
});
// Removed res.json(formattedUsers) to avoid duplicate response if needed, 
// but actually the previous code was: res.json(formattedUsers).
// We are REPLACING the whole block or appending?
// The instruction says "Add GET and PUT routes".
// I should probably KEEP the 'get all' route if used by admin, but ADD the individual routes.
// To avoid messing up the tool call which replaces a chunk, I'll replace the end of the file to append new routes before module.exports.
// BUT, wait, I can just replace the whole file or append.
// Let's look at the file content again. It ends at line 34.
// I will append the new routes BEFORE module.exports.




// @desc    Get user profile
// @route   GET /users/:id
// @access  Protected
router.get('/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (user) {
            res.json({
                _id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                contact: user.contact,
                address: user.address,
                jobRole: user.jobRole,
                role: user.role,
                gender: user.gender,
                skills: user.skills,
                atsScore: user.atsScore,
                resumeStrength: user.resumeStrength,
                resumeWeakness: user.resumeWeakness
            });
        } else {
            res.status(404).json({ detail: 'User not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ detail: 'Server Error' });
    }
});

// @desc    Update user profile
// @route   PUT /users/:id
// @access  Protected
router.put('/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (user) {
            user.firstName = req.body.firstName || user.firstName;
            user.lastName = req.body.lastName || user.lastName;
            user.contact = req.body.contact || user.contact;
            user.address = req.body.address || user.address;
            user.jobRole = req.body.jobRole || user.jobRole;
            user.gender = req.body.gender || user.gender;
            user.skills = req.body.skills || user.skills;
            // Update analysis data if provided
            if (req.body.atsScore !== undefined) user.atsScore = req.body.atsScore;
            if (req.body.resumeStrength !== undefined) user.resumeStrength = req.body.resumeStrength;
            if (req.body.resumeWeakness !== undefined) user.resumeWeakness = req.body.resumeWeakness;
            // email is usually not updated directly or needs verification

            const updatedUser = await user.save();

            res.json({
                _id: updatedUser._id,
                firstName: updatedUser.firstName,
                lastName: updatedUser.lastName,
                email: updatedUser.email,
                contact: updatedUser.contact,
                address: updatedUser.address,
                jobRole: updatedUser.jobRole,
                role: updatedUser.role,
                gender: updatedUser.gender,
                skills: updatedUser.skills
            });
        } else {
            res.status(404).json({ detail: 'User not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ detail: 'Server Error' });
    }
});

// @desc    Delete user
// @route   DELETE /users/:id
// @access  Protected (Admin)
router.delete('/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (user) {
            await User.findByIdAndDelete(req.params.id);
            res.json({ message: 'User removed' });
        } else {
            res.status(404).json({ detail: 'User not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ detail: 'Server Error' });
    }
});

module.exports = router;
