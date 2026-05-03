const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

const initDB = async () => {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(20) DEFAULT 'member' CHECK (role IN ('admin', 'member')),
        avatar VARCHAR(10) DEFAULT '👤',
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS projects (
        id SERIAL PRIMARY KEY,
        name VARCHAR(150) NOT NULL,
        description TEXT,
        status VARCHAR(30) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'on-hold')),
        owner_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        deadline DATE,
        sector VARCHAR(100),
        created_at TIMESTAMP DEFAULT NOW()
      );

      ALTER TABLE projects ADD COLUMN IF NOT EXISTS sector VARCHAR(100);

      CREATE TABLE IF NOT EXISTS project_members (
        project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        role VARCHAR(20) DEFAULT 'member' CHECK (role IN ('admin', 'member')),
        joined_at TIMESTAMP DEFAULT NOW(),
        PRIMARY KEY (project_id, user_id)
      );

      CREATE TABLE IF NOT EXISTS tasks (
        id SERIAL PRIMARY KEY,
        title VARCHAR(200) NOT NULL,
        description TEXT,
        status VARCHAR(30) DEFAULT 'todo' CHECK (status IN ('todo', 'in-progress', 'review', 'done')),
        priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
        project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
        assigned_to INTEGER REFERENCES users(id) ON DELETE SET NULL,
        created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
        deadline DATE,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS comments (
        id SERIAL PRIMARY KEY,
        task_id INTEGER REFERENCES tasks(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✅ Database initialized successfully');
  } catch (err) {
    console.error('❌ DB Init Error:', err.message);
  } finally {
    client.release();
  }
};

module.exports = { pool, initDB };
