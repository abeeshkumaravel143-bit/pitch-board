require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();

app.use(cors({ origin: 'http://localhost:5173' })); // React (Vite) dev server
app.use(express.json());                            // parse JSON request bodies

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Central error handler (must be last)
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || 'Server error' });
});

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});