const { pool } = require('../config/database');

exports.createTask = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { title, description, priority, assigned_to, deadline } = req.body;

    if (!title) return res.status(400).json({ error: 'Task title is required.' });

    const member = await pool.query(
      'SELECT 1 FROM project_members WHERE project_id = $1 AND user_id = $2',
      [projectId, req.user.id]
    );
    if (!member.rows[0]) return res.status(403).json({ error: 'Not a project member.' });

    const result = await pool.query(`
      INSERT INTO tasks (title, description, priority, project_id, assigned_to, created_by, deadline)
      VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *
    `, [title.trim(), description, priority || 'medium', projectId, assigned_to || null, req.user.id, deadline || null]);

    const task = result.rows[0];

    const fullTask = await pool.query(`
      SELECT t.*, u.name as assignee_name, u.avatar as assignee_avatar, c.name as creator_name
      FROM tasks t
      LEFT JOIN users u ON t.assigned_to = u.id
      LEFT JOIN users c ON t.created_by = c.id
      WHERE t.id = $1
    `, [task.id]);

    res.status(201).json({ task: fullTask.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create task.' });
  }
};

exports.getTasks = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { status, priority, assigned_to } = req.query;

    let query = `
      SELECT t.*, u.name as assignee_name, u.avatar as assignee_avatar, c.name as creator_name
      FROM tasks t
      LEFT JOIN users u ON t.assigned_to = u.id
      LEFT JOIN users c ON t.created_by = c.id
      WHERE t.project_id = $1
    `;
    const params = [projectId];
    
    if (status) { query += ` AND t.status = $${params.length + 1}`; params.push(status); }
    if (priority) { query += ` AND t.priority = $${params.length + 1}`; params.push(priority); }
    if (assigned_to) { query += ` AND t.assigned_to = $${params.length + 1}`; params.push(assigned_to); }
    
    query += ' ORDER BY t.created_at DESC';

    const result = await pool.query(query, params);
    res.json({ tasks: result.rows });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch tasks.' });
  }
};

exports.updateTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { title, description, status, priority, assigned_to, deadline } = req.body;

    const result = await pool.query(`
      UPDATE tasks SET
        title = COALESCE($1, title),
        description = COALESCE($2, description),
        status = COALESCE($3, status),
        priority = COALESCE($4, priority),
        assigned_to = COALESCE($5, assigned_to),
        deadline = COALESCE($6, deadline),
        updated_at = NOW()
      WHERE id = $7 RETURNING *
    `, [title, description, status, priority, assigned_to, deadline, taskId]);

    if (!result.rows[0]) return res.status(404).json({ error: 'Task not found.' });

    const fullTask = await pool.query(`
      SELECT t.*, u.name as assignee_name, u.avatar as assignee_avatar, c.name as creator_name
      FROM tasks t
      LEFT JOIN users u ON t.assigned_to = u.id
      LEFT JOIN users c ON t.created_by = c.id
      WHERE t.id = $1
    `, [taskId]);

    res.json({ task: fullTask.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update task.' });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    await pool.query('DELETE FROM tasks WHERE id = $1', [taskId]);
    res.json({ message: 'Task deleted.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete task.' });
  }
};

exports.getDashboard = async (req, res) => {
  try {
    const userId = req.user.id;

    const [myTasks, overdueTasks, projectStats, recentActivity] = await Promise.all([
      pool.query(`
        SELECT t.*, p.name as project_name, u.avatar as assignee_avatar
        FROM tasks t JOIN projects p ON t.project_id = p.id
        LEFT JOIN users u ON t.assigned_to = u.id
        WHERE t.assigned_to = $1 AND t.status != 'done'
        ORDER BY t.deadline ASC NULLS LAST, t.priority DESC LIMIT 10
      `, [userId]),
      pool.query(`
        SELECT COUNT(*) as count FROM tasks t
        JOIN project_members pm ON t.project_id = pm.project_id
        WHERE pm.user_id = $1 AND t.deadline < NOW() AND t.status != 'done'
      `, [userId]),
      pool.query(`
        SELECT p.id, p.name, p.status,
          COUNT(t.id) as total_tasks,
          COUNT(CASE WHEN t.status = 'done' THEN 1 END) as done_tasks,
          COUNT(DISTINCT pm.user_id) as member_count
        FROM projects p
        JOIN project_members pm ON p.id = pm.project_id
        LEFT JOIN tasks t ON p.id = t.project_id
        WHERE pm.user_id = $1
        GROUP BY p.id ORDER BY p.created_at DESC LIMIT 5
      `, [userId]),
      pool.query(`
        SELECT t.id, t.title, t.status, t.updated_at, p.name as project_name
        FROM tasks t JOIN projects p ON t.project_id = p.id
        JOIN project_members pm ON p.id = pm.project_id
        WHERE pm.user_id = $1
        ORDER BY t.updated_at DESC LIMIT 8
      `, [userId]),
    ]);

    const tasksByStatus = await pool.query(`
      SELECT t.status, COUNT(*) as count
      FROM tasks t JOIN project_members pm ON t.project_id = pm.project_id
      WHERE pm.user_id = $1
      GROUP BY t.status
    `, [userId]);

    res.json({
      myTasks: myTasks.rows,
      overdueTasks: parseInt(overdueTasks.rows[0].count),
      projects: projectStats.rows,
      recentActivity: recentActivity.rows,
      tasksByStatus: tasksByStatus.rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load dashboard.' });
  }
};
