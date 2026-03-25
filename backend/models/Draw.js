const mongoose = require('mongoose');

const drawSchema = new mongoose.Schema({
    month: { type: String, required: true },
    type: { type: String, enum: ['random', 'algorithmic'], default: 'random' },
    status: { type: String, enum: ['Pending', 'Published', 'Simulated'], default: 'Pending' },
    winningNumbers: { type: [Number] },
    prizePool: { type: Number, required: true },
    fiveMatchWinners: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    fourMatchWinners: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    threeMatchWinners: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    jackpotRolledOver: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Draw', drawSchema);
