const Interest = require('../models/Interest');
const Pitch = require('../models/Pitch');

// POST /api/pitches/:id/interest  (investor only)
exports.expressInterest = async (req, res, next) => {
  try {
    const pitch = await Pitch.findById(req.params.id);
    if (!pitch) return res.status(404).json({ message: 'Pitch not found' });

    const interest = await Interest.create({
      pitch: pitch._id,
      investor: req.user._id,
      message: req.body.message,
    });
    res.status(201).json(interest);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'You already expressed interest in this pitch' });
    }
    next(err);
  }
};

// GET /api/interests/mine
exports.getMyInterests = async (req, res, next) => {
  try {
    if (req.user.role === 'investor') {
      const interests = await Interest.find({ investor: req.user._id })
        .populate('pitch', 'title sector stage')
        .sort({ createdAt: -1 });
      return res.json(interests);
    }

    // Founder: interests received on their own pitches
    const pitches = await Pitch.find({ founder: req.user._id }).select('_id');
    const interests = await Interest.find({ pitch: { $in: pitches.map((p) => p._id) } })
      .populate('pitch', 'title')
      .populate('investor', 'name email')
      .sort({ createdAt: -1 });
    res.json(interests);
  } catch (err) {
    next(err);
  }
};