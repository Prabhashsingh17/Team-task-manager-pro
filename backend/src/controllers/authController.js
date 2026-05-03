const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');

const avatars = ['🦁', '🐯', '🦊', '🐺', '🦝', '🐻', '🦄', '🐲', '🦅', '🐬'];

const generateToken = (user) => {
  return jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

exports.signup = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }
    
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Email already registered.' });
    }
    
    const hashed = await bcrypt.hash(password, 12);
    const avatar = avatars[Math.floor(Math.random() * avatars.length)];
    const userRole = role === 'admin' ? 'admin' : 'member';
    
    const result = await pool.query(
      'INSERT INTO users (name, email, password, role, avatar) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, role, avatar',
      [name.trim(), email.toLowerCase(), hashed, userRole, avatar]
    );
    
    const user = result.rows[0];
    const token = generateToken(user);
    
    res.status(201).json({ token, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error during signup.' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }
    
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase()]);
    const user = result.rows[0];
    
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }
    
    const token = generateToken(user);
    const { password: _, ...userData } = user;
    
    res.json({ token, user: userData });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error during login.' });
  }
};

exports.getMe = async (req, res) => {
  res.json({ user: req.user });
};
