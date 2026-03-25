require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const stripeRoutes = require('./routes/stripe');

const app = express();
app.use(cors({
    origin: '*', // Allow all for public Vercel availability
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    credentials: true,
}));

// Handle preflight OPTIONS requests explicitly if needed
app.options('*', cors());

// Webhook must be parsed as raw body before express.json
app.use('/api/stripe/webhook', express.raw({ type: 'application/json' }), stripeRoutes);

// General JSON parsing for other routes
app.use(express.json());

// Routes
const userRoutes = require('./routes/user');
const drawRoutes = require('./routes/draw');
const adminRoutes = require('./routes/admin');

app.use('/api/auth', authRoutes);
app.use('/api/stripe', stripeRoutes);
app.use('/api/user', userRoutes);
app.use('/api/draw', drawRoutes);
app.use('/api/admin', adminRoutes);

const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch((error) => console.error('MongoDB connection error:', error));

app.get('/', (req, res) => {
    res.send('Golf Charity Subscription Platform API Remote');
});

const PORT = process.env.PORT || 5000;

// Export mapping for Vercel serverless functions
module.exports = app;

if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}
