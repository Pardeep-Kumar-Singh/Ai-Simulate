const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    contact: {
        type: String,
        default: '',
    },
    address: {
        type: String,
        default: '',
    },
    jobRole: {
        type: String,
        default: 'Student', // Default job role
    },
    status: {
        type: String,
        default: 'active',
    },
    role: {
        type: String,
        default: 'student',
    },
    gender: {
        type: String,
        default: 'male',
    },
    skills: {
        type: [String],
        default: [],
    },
    atsScore: {
        type: Number,
        default: 0,
    },
    resumeStrength: {
        type: [String],
        default: [],
    },
    resumeWeakness: {
        type: [String],
        default: [],
    },
}, {
    timestamps: true, // Automatically adds createdAt and updatedAt
});

const User = mongoose.model('User', userSchema);

module.exports = User;
