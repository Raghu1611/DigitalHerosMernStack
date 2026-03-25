require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./models/User');

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
    console.error('MONGO_URI is not defined in .env');
    process.exit(1);
}

async function seed() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        const salt = await bcrypt.genSalt(10);
        const adminPassword = await bcrypt.hash('admin123', salt);
        const userPassword = await bcrypt.hash('user123', salt);

        // Delete existing mock users if they exist to avoid unique constraint errors
        await User.deleteMany({ email: { $in: ['admin@digitalheroes.com', 'user@digitalheroes.com'] } });

        const admin = new User({
            name: 'Evaluating Admin',
            email: 'admin@digitalheroes.com',
            password: adminPassword,
            role: 'Admin',
            subscriptionStatus: 'active'
        });

        const subscriber = new User({
            name: 'Testing Subscriber',
            email: 'user@digitalheroes.com',
            password: userPassword,
            role: 'Subscriber',
            subscriptionStatus: 'active'
        });

        await admin.save();
        await subscriber.save();

        console.log('Successfully seeded Admin and Subscriber accounts!');
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

seed();
