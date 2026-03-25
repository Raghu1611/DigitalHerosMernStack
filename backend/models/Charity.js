const mongoose = require('mongoose');

const charitySchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    images: { type: [String] },
    upcomingEvents: { type: [String] },
    featured: { type: Boolean, default: false },
    totalContributions: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Charity', charitySchema);
