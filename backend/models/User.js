const mongoose = require('mongoose');

const scoreSchema = new mongoose.Schema({
    score: {
        type: Number,
        min: 1,
        max: 45,
        required: true
    },
    date: {
        type: Date,
        default: Date.now,
        required: true
    }
});

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['Visitor', 'Subscriber', 'Admin'], default: 'Visitor' },
    stripeSubscriptionId: { type: String },
    subscriptionStatus: { type: String, enum: ['active', 'inactive', 'canceled', 'past_due'], default: 'inactive' },
    scores: {
        type: [scoreSchema],
        validate: [arrayLimit, '{PATH} exceeds the limit of 5']
    },
    selectedCharity: { type: mongoose.Schema.Types.ObjectId, ref: 'Charity' },
    charityPercentage: { type: Number, default: 10, min: 10, max: 100 },
    winnings: { type: Number, default: 0 },
    winningsStatus: { type: String, enum: ['Pending', 'Paid'], default: 'Pending' }
}, {
    timestamps: true
});

function arrayLimit(val) {
    return val.length <= 5;
}

// Pre-save middleware to handle the rolling 5 scores
userSchema.pre('save', function () {
    if (this.scores && this.scores.length > 5) {
        // Sort by date (newest first)
        this.scores.sort((a, b) => b.date - a.date);
        // keep only latest 5
        this.scores = this.scores.slice(0, 5);
    }
});

module.exports = mongoose.model('User', userSchema);
