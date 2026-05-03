const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');

const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Access denied. No token provided.' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const result = await pool.query('SELECT id, name, email, role, avatar FROM users WHERE id = $1', [decoded.id]);
    
    if (!result.rows[0]) return res.status(401).json({ error: 'User not found.' });
    
    req.user = result.rows[0];
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid or expired token.' });
  }
};

const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required.' });
  }
  next();
};

const requireProjectAdmin = async (req, res, next) => {
  try {
    const projectId = req.params.projectId || req.params.id;
    const result = await pool.query(
      'SELECT role FROM project_members WHERE project_id = $1 AND user_id = $2',
      [projectId, req.user.id]
    );
    
    const isOwner = await pool.query('SELECT owner_id FROM projects WHERE id = $1', [projectId]);
    
    if (isOwner.rows[0]?.owner_id === req.user.id || result.rows[0]?.role === 'admin' || req.user.role === 'admin') {
      return next();
    }
    
    res.status(403).json({ error: 'Project admin access required.' });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
};

module.exports = { authenticate, requireAdmin, requireProjectAdmin };
