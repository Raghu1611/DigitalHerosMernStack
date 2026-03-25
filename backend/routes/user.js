const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error('JWT_SECRET is missing in .env');

// Middleware to verify token and extract user
const authMiddleware = async (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token, authorization denied' });

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = await User.findById(decoded.user.id).select('-password');
        next();
    } catch (err) {
        res.status(401).json({ message: 'Token is not valid' });
    }
};

// Add a score
router.post('/score', authMiddleware, async (req, res) => {
    try {
        const { score } = req.body;

        // Validate Stableford range
        if (typeof score !== 'number' || score < 1 || score > 45) {
            return res.status(400).json({ message: 'Score must be a number between 1 and 45' });
        }

        const user = req.user;

        // Add to array, Mongoose pre-save hook handles the rolling 5 logic
        user.scores.push({ score, date: new Date() });
        await user.save();

        res.json({ message: 'Score added successfully', scores: user.scores });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Update Charity Settings
router.put('/charity', authMiddleware, async (req, res) => {
    try {
        const { charityId, percentage } = req.body;

        if (percentage < 10 || percentage > 100) {
            return res.status(400).json({ message: 'Contribution percentage must be between 10% and 100%' });
        }

        const user = req.user;
        user.selectedCharity = charityId;
        user.charityPercentage = percentage;

        await user.save();

        res.json({ message: 'Charity preferences updated', user });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
