require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./models/User');

const MONGO_URI = 'mongodb+srv://2200032009cseh_db_user:2200032009cseh_db_user@cluster0.1lngg80.mongodb.net/golf-charity?retryWrites=true&w=majority&appName=Cluster0';

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
