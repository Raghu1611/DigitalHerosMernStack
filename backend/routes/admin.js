const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Charity = require('../models/Charity');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error('JWT_SECRET is missing in .env');

// Admin Auth Middleware
const adminAuthMiddleware = async (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token, authorization denied' });

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = await User.findById(decoded.user.id).select('-password');
        
        if (req.user.role !== 'Admin') {
            return res.status(403).json({ message: 'Admin access required' });
        }
        next();
    } catch (err) {
        res.status(401).json({ message: 'Token is not valid' });
    }
};

// Get all users with Pending Winnings
router.get('/winners', adminAuthMiddleware, async (req, res) => {
    try {
        const winners = await User.find({ winnings: { $gt: 0 } }).select('-password -scores');
        res.json(winners);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Verify Winner and Mark Paid
router.put('/winner/pay/:id', adminAuthMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.winningsStatus = 'Paid';
        await user.save();

        res.json({ message: 'Payout marked as completed', user });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// --- CHARITY ROUTES ---
// Add new Charity
router.post('/charity', adminAuthMiddleware, async (req, res) => {
    try {
        const { name, description, images, upcomingEvents, featured } = req.body;
        
        const newCharity = new Charity({
            name, description, images, upcomingEvents, featured
        });

        await newCharity.save();
        res.json({ message: 'Charity created successfully', charity: newCharity });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Update Charity Total Contributions
// This route can be triggered periodically or securely to update all charities based on active subscribers 

// Get all charities (Public)
router.get('/charities', async (req, res) => {
    try {
        const charities = await Charity.find({}).sort({ featured: -1, createdAt: -1 });
        res.json(charities);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
