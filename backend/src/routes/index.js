const express = require('express');
const router = express.Router();
const authCtrl = require('../controllers/authController');
const projectCtrl = require('../controllers/projectController');
const taskCtrl = require('../controllers/taskController');
const { authenticate, requireProjectAdmin } = require('../middleware/auth');

// Auth
router.post('/auth/signup', authCtrl.signup);
router.post('/auth/login', authCtrl.login);
router.get('/auth/me', authenticate, authCtrl.getMe);

// Dashboard
router.get('/dashboard', authenticate, taskCtrl.getDashboard);

// Projects
router.get('/projects', authenticate, projectCtrl.getProjects);
router.post('/projects', authenticate, projectCtrl.createProject);
router.get('/projects/:id', authenticate, projectCtrl.getProject);
router.put('/projects/:id', authenticate, requireProjectAdmin, projectCtrl.updateProject);
router.delete('/projects/:id', authenticate, projectCtrl.deleteProject);
router.post('/projects/:id/members', authenticate, requireProjectAdmin, projectCtrl.addMember);
router.delete('/projects/:id/members/:userId', authenticate, requireProjectAdmin, projectCtrl.removeMember);

// Tasks
router.get('/projects/:projectId/tasks', authenticate, taskCtrl.getTasks);
router.post('/projects/:projectId/tasks', authenticate, taskCtrl.createTask);
router.put('/tasks/:taskId', authenticate, taskCtrl.updateTask);
router.delete('/tasks/:taskId', authenticate, taskCtrl.deleteTask);

// Users search
router.get('/users/search', authenticate, async (req, res) => {
  const { pool } = require('../config/database');
  const { q } = req.query;
  if (!q) return res.json({ users: [] });
  const result = await pool.query(
    'SELECT id, name, email, avatar FROM users WHERE (name ILIKE $1 OR email ILIKE $1) AND id != $2 LIMIT 10',
    [`%${q}%`, req.user.id]
  );
  res.json({ users: result.rows });
});

module.exports = router;
