const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Draw = require('../models/Draw');
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

// --- ADMIN ROUTES ---

// Helper function to calculate pool based on active subscribers
// Assuming $19/mo, $5 per sub goes to pool as an example baseline.
const calculatePrizePool = async () => {
    const activeUsers = await User.countDocuments({ subscriptionStatus: 'active' });
    return activeUsers * 5; // $5 from each active subscriber
};

// Run / Simulate Draw
router.post('/simulate', adminAuthMiddleware, async (req, res) => {
    try {
        const { type } = req.body; // 'random' or 'algorithmic'
        
        // Generate 5 random numbers between 1 and 45
        let winningNumbers = [];
        if (type === 'random' || !type) {
            while (winningNumbers.length < 5) {
                const r = Math.floor(Math.random() * 45) + 1;
                if (!winningNumbers.includes(r)) winningNumbers.push(r);
            }
        } else {
            // Algorithmic: MVP pseudo-weighted (falling back to random for simplicity in simulation)
            while (winningNumbers.length < 5) {
                const r = Math.floor(Math.random() * 45) + 1;
                if (!winningNumbers.includes(r)) winningNumbers.push(r);
            }
        }

        winningNumbers.sort((a, b) => a - b);
        
        const prizePool = await calculatePrizePool();
        
        // Fetch all active users who have 5 scores
        const eligibleUsers = await User.find({ 
            subscriptionStatus: 'active',
            'scores.4': { $exists: true } // Array length at least 5
        });

        const fiveMatch = [];
        const fourMatch = [];
        const threeMatch = [];

        eligibleUsers.forEach(user => {
            const userScores = user.scores.map(s => s.score);
            let matches = 0;
            
            userScores.forEach(score => {
                if (winningNumbers.includes(score)) matches++;
            });

            if (matches === 5) fiveMatch.push(user._id);
            if (matches === 4) fourMatch.push(user._id);
            if (matches === 3) threeMatch.push(user._id);
        });

        const drawData = {
            month: new Date().toLocaleString('default', { month: 'long', year: 'numeric' }),
            type: type || 'random',
            status: 'Simulated',
            winningNumbers,
            prizePool,
            fiveMatchWinners: fiveMatch,
            fourMatchWinners: fourMatch,
            threeMatchWinners: threeMatch,
            jackpotRolledOver: fiveMatch.length === 0
        };

        const draw = new Draw(drawData);
        await draw.save();

        res.json({ message: 'Draw Simulated Successfully', draw });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Publish Draw (Executes payouts internally marking "Pending" winnings)
router.post('/publish/:id', adminAuthMiddleware, async (req, res) => {
    try {
        const draw = await Draw.findById(req.params.id);
        if (!draw) return res.status(404).json({ message: 'Draw not found' });
        if (draw.status === 'Published') return res.status(400).json({ message: 'Draw already published' });

        draw.status = 'Published';
        
        const pot5 = draw.prizePool * 0.40;
        const pot4 = draw.prizePool * 0.35;
        const pot3 = draw.prizePool * 0.25;

        // Note: Real logic would persist previous month's rolled over jackpot to pot5
        
        // Distribute winnings to users by mapping IDs and incrementing their "winnings" field
        if (draw.fiveMatchWinners.length > 0) {
            const split = pot5 / draw.fiveMatchWinners.length;
            await User.updateMany({ _id: { $in: draw.fiveMatchWinners } }, { $inc: { winnings: split }, winningsStatus: 'Pending' });
        }
        
        if (draw.fourMatchWinners.length > 0) {
            const split = pot4 / draw.fourMatchWinners.length;
            await User.updateMany({ _id: { $in: draw.fourMatchWinners } }, { $inc: { winnings: split }, winningsStatus: 'Pending' });
        }

        if (draw.threeMatchWinners.length > 0) {
            const split = pot3 / draw.threeMatchWinners.length;
            await User.updateMany({ _id: { $in: draw.threeMatchWinners } }, { $inc: { winnings: split }, winningsStatus: 'Pending' });
        }

        await draw.save();
        res.json({ message: 'Draw Published and Winnings Distributed', draw });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// --- PUBLIC ROUTES ---
// Get all published draws
router.get('/', async (req, res) => {
    try {
        const draws = await Draw.find({ status: 'Published' }).sort({ createdAt: -1 });
        res.json(draws);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
