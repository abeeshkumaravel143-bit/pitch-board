const mongoose = require('mongoose');

const interestSchema = new mongoose.Schema(
  {
    pitch: { type: mongoose.Schema.Types.ObjectId, ref: 'Pitch', required: true },
    investor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    message: { type: String, trim: true, maxlength: 500, default: '' },
  },
  { timestamps: true }
);

// One investor can express interest in a pitch only once
interestSchema.index({ pitch: 1, investor: 1 }, { unique: true });

module.exports = mongoose.model('Interest', interestSchema);