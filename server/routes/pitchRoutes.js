const express = require('express');
const {
  getPitches, getPitch, createPitch, updatePitch, deletePitch,
} = require('../controllers/pitchController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', protect, getPitches);
router.get('/:id', protect, getPitch);
router.post('/', protect, authorize('founder'), createPitch);
router.put('/:id', protect, authorize('founder'), updatePitch);
router.delete('/:id', protect, authorize('founder'), deletePitch);

module.exports = router;