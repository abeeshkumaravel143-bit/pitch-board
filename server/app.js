require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/pitches', require('./routes/pitchRoutes'));
app.use('/api/interests', require('./routes/interestRoutes'));

// Unknown routes
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Central error handler (must be last)
app.use((err, req, res, next) => {
  if (err.name === 'CastError') {
    return res.status(400).json({ message: 'Invalid id' });
  }
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || 'Server error' });
});

module.exports = app;