const { pool } = require('../config/database');

exports.createProject = async (req, res) => {
  try {
    const { name, description, deadline, sector } = req.body;
    if (!name) return res.status(400).json({ error: 'Project name is required.' });

    const result = await pool.query(
      'INSERT INTO projects (name, description, owner_id, deadline, sector) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name.trim(), description, req.user.id, deadline || null, sector?.trim?.() ? sector.trim() : null]
    );
    const project = result.rows[0];

    await pool.query(
      'INSERT INTO project_members (project_id, user_id, role) VALUES ($1, $2, $3)',
      [project.id, req.user.id, 'admin']
    );

    res.status(201).json({ project });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create project.' });
  }
};

exports.getProjects = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT p.*, u.name as owner_name, u.avatar as owner_avatar,
        COUNT(DISTINCT pm.user_id) as member_count,
        COUNT(DISTINCT t.id) as task_count,
        COUNT(DISTINCT CASE WHEN t.status = 'done' THEN t.id END) as completed_tasks
      FROM projects p
      JOIN users u ON p.owner_id = u.id
      JOIN project_members pm ON p.id = pm.project_id
      LEFT JOIN tasks t ON p.id = t.project_id
      WHERE pm.user_id = $1
      GROUP BY p.id, u.name, u.avatar
      ORDER BY p.created_at DESC
    `, [req.user.id]);

    res.json({ projects: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch projects.' });
  }
};

exports.getProject = async (req, res) => {
  try {
    const { id } = req.params;
    
    const projectResult = await pool.query(`
      SELECT p.*, u.name as owner_name, u.avatar as owner_avatar,
        COUNT(DISTINCT t.id) as task_count,
        COUNT(DISTINCT CASE WHEN t.status = 'done' THEN t.id END) as completed_tasks
      FROM projects p
      JOIN users u ON p.owner_id = u.id
      LEFT JOIN tasks t ON p.id = t.project_id
      WHERE p.id = $1
      GROUP BY p.id, u.name, u.avatar
    `, [id]);

    if (!projectResult.rows[0]) return res.status(404).json({ error: 'Project not found.' });

    const membersResult = await pool.query(`
      SELECT u.id, u.name, u.email, u.avatar, pm.role, pm.joined_at
      FROM project_members pm JOIN users u ON pm.user_id = u.id
      WHERE pm.project_id = $1
    `, [id]);

    const tasksResult = await pool.query(`
      SELECT t.*, u.name as assignee_name, u.avatar as assignee_avatar,
        c.name as creator_name
      FROM tasks t
      LEFT JOIN users u ON t.assigned_to = u.id
      LEFT JOIN users c ON t.created_by = c.id
      WHERE t.project_id = $1
      ORDER BY t.created_at DESC
    `, [id]);

    res.json({
      project: projectResult.rows[0],
      members: membersResult.rows,
      tasks: tasksResult.rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch project.' });
  }
};

exports.updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, status, deadline } = req.body;

    const result = await pool.query(
      'UPDATE projects SET name = COALESCE($1, name), description = COALESCE($2, description), status = COALESCE($3, status), deadline = COALESCE($4, deadline) WHERE id = $5 RETURNING *',
      [name, description, status, deadline, id]
    );

    res.json({ project: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update project.' });
  }
};

exports.deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await pool.query('SELECT owner_id FROM projects WHERE id = $1', [id]);
    
    if (!project.rows[0]) return res.status(404).json({ error: 'Project not found.' });
    if (project.rows[0].owner_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only project owner can delete this project.' });
    }
    
    await pool.query('DELETE FROM projects WHERE id = $1', [id]);
    res.json({ message: 'Project deleted successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete project.' });
  }
};

exports.addMember = async (req, res) => {
  try {
    const { id } = req.params;
    const { email, role } = req.body;

    const userResult = await pool.query('SELECT id, name, avatar FROM users WHERE email = $1', [email]);
    if (!userResult.rows[0]) return res.status(404).json({ error: 'User not found with this email.' });

    const user = userResult.rows[0];
    const existing = await pool.query('SELECT 1 FROM project_members WHERE project_id = $1 AND user_id = $2', [id, user.id]);
    if (existing.rows[0]) return res.status(409).json({ error: 'User already in this project.' });

    await pool.query(
      'INSERT INTO project_members (project_id, user_id, role) VALUES ($1, $2, $3)',
      [id, user.id, role || 'member']
    );

    res.json({ message: 'Member added.', user });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add member.' });
  }
};

exports.removeMember = async (req, res) => {
  try {
    const { id, userId } = req.params;
    await pool.query('DELETE FROM project_members WHERE project_id = $1 AND user_id = $2', [id, userId]);
    res.json({ message: 'Member removed.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to remove member.' });
  }
};
