const jwt = require('jsonwebtoken');
const User = require('../models/User');

const signToken = (user) =>
  jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });

const userResponse = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
});

exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    if (!['founder', 'investor'].includes(role)) {
      return res.status(400).json({ message: 'Role must be founder or investor' });
    }
    if (await User.findOne({ email })) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const user = await User.create({ name, email, password, role });
    res.status(201).json({ token: signToken(user), user: userResponse(user) });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    res.json({ token: signToken(user), user: userResponse(user) });
  } catch (err) {
    next(err);
  }
};