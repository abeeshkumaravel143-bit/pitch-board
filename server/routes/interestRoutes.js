const express = require('express');
const { getMyInterests } = require('../controllers/interestController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/mine', protect, getMyInterests);

module.exports = router;