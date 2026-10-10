const mongoose = require('mongoose');

const pitchSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    sector: { type: String, required: true, trim: true },
    stage: {
      type: String,
      enum: ['idea', 'prototype', 'seed', 'series-a'],
      required: true,
    },
    fundingAsk: { type: Number, required: true, min: 0 },
    description: { type: String, required: true },
    founder: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Pitch', pitchSchema);