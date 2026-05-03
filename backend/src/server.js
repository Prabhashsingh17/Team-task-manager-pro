require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { initDB, pool } = require('./config/database');
const { seedDemoPortfolioIfEligible } = require('./demoSeed');
const routes = require('./routes/index');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  // Dev: Vite is often opened as localhost OR 127.0.0.1 — both must work.
  // Prod: lock to FRONTEND_URL (required for credentialed requests).
  origin:
    process.env.NODE_ENV === 'production'
      ? process.env.FRONTEND_URL || '*'
      : true,
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Team Task Manager API is running 🚀', timestamp: new Date().toISOString() });
});

app.use('/api', routes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const start = async () => {
  await initDB();
  await seedDemoPortfolioIfEligible(pool);
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
  });
};

start();
