const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error('JWT_SECRET is missing in .env');

// Register User
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        // Check if user exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        user = new User({
            name,
            email,
            password: hashedPassword,
            role: role || 'Visitor'
        });

        await user.save();

        const payload = { user: { id: user.id, role: user.role } };
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });

        res.status(201).json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role, subscriptionStatus: user.subscriptionStatus } });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error: ' + err.message });
    }
});

// Login User
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid Credentials' });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid Credentials' });
        }

        const payload = { user: { id: user.id, role: user.role } };
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });

        res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role, subscriptionStatus: user.subscriptionStatus } });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Get logged in user (protected route example)
router.get('/me', async (req, res) => {
    // Basic middleware logic manually inline for speed, usually abstracted
    const token = req.header('Authorization')?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token, authorization denied' });

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findById(decoded.user.id).select('-password');
        res.json(user);
    } catch (err) {
        res.status(401).json({ message: 'Token is not valid' });
    }
});

module.exports = router;
