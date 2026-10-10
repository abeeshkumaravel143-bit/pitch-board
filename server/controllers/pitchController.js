const Pitch = require('../models/Pitch');

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// GET /api/pitches?sector=fintech&stage=seed&q=ai
exports.getPitches = async (req, res, next) => {
  try {
    const { sector, stage, q } = req.query;
    const filter = {};

    if (sector) filter.sector = new RegExp(`^${escapeRegex(sector)}$`, 'i');
    if (stage) filter.stage = stage;
    if (q) filter.title = new RegExp(escapeRegex(q), 'i');

    const pitches = await Pitch.find(filter)
      .populate('founder', 'name')
      .sort({ createdAt: -1 });

    res.json(pitches);
  } catch (err) {
    next(err);
  }
};

// GET /api/pitches/:id
exports.getPitch = async (req, res, next) => {
  try {
    const pitch = await Pitch.findById(req.params.id).populate('founder', 'name');
    if (!pitch) return res.status(404).json({ message: 'Pitch not found' });
    res.json(pitch);
  } catch (err) {
    next(err);
  }
};

// POST /api/pitches  (founder only)
exports.createPitch = async (req, res, next) => {
  try {
    const { title, sector, stage, fundingAsk, description } = req.body;
    const pitch = await Pitch.create({
      title, sector, stage, fundingAsk, description,
      founder: req.user._id,
    });
    res.status(201).json(pitch);
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: err.message });
    }
    next(err);
  }
};

// PUT /api/pitches/:id  (owner only)
exports.updatePitch = async (req, res, next) => {
  try {
    const pitch = await Pitch.findById(req.params.id);
    if (!pitch) return res.status(404).json({ message: 'Pitch not found' });

    if (pitch.founder.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only edit your own pitches' });
    }

    const { title, sector, stage, fundingAsk, description } = req.body;
    Object.assign(pitch, { title, sector, stage, fundingAsk, description });
    await pitch.save();

    res.json(pitch);
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: err.message });
    }
    next(err);
  }
};

// DELETE /api/pitches/:id  (owner only)
exports.deletePitch = async (req, res, next) => {
  try {
    const pitch = await Pitch.findById(req.params.id);
    if (!pitch) return res.status(404).json({ message: 'Pitch not found' });

    if (pitch.founder.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only delete your own pitches' });
    }

    await pitch.deleteOne();
    res.json({ message: 'Pitch deleted' });
  } catch (err) {
    next(err);
  }
};