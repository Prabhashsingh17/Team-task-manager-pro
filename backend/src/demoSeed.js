const bcrypt = require('bcryptjs');

/** Rich cross-sector demo data — only inserted when DB has zero projects */
const TEAM = [
  { name: 'Ava Nguyen', email: 'ava.nguyen.portfolio@internal.taskflow.dev' },
  { name: 'Marcus Patel', email: 'marcus.patel.portfolio@internal.taskflow.dev' },
  { name: 'Sofia Martins', email: 'sofia.martins.portfolio@internal.taskflow.dev' },
  { name: 'Daniel Okonkwo', email: 'daniel.okonkwo.portfolio@internal.taskflow.dev' },
];

const DAYS = (n) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
};

/** @type {Array<{ sector: string; name: string; description: string; status: string; deadlineDays: number; tasks: Array<{ title: string; description?: string; status: string; priority: string; deadlineOffset?: number|null}>}>} */
const PORTFOLIO = [
  {
    sector: 'FinTech & Banking',
    status: 'active',
    deadlineDays: 42,
    name: 'Corporate treasury cockpit',
    description:
      'Executive-grade liquidity view across APAC hubs: reconcile payment rails vs GL buckets, treasury policy checks, audit-grade activity trail for regulator review.',
    tasks: [
      { title: 'Source-of-truth matrix: rails ↔ GL buckets', status: 'todo', priority: 'urgent', deadlineOffset: 4 },
      { title: 'FX exposure tiles + anomaly alerts MVP', status: 'in-progress', priority: 'high', deadlineOffset: 11 },
      { title: 'SOC2 evidence pack automation', status: 'review', priority: 'high', deadlineOffset: 18 },
      { title: 'Release checklist & dry-run playbook', status: 'done', priority: 'medium', deadlineOffset: -2 },
    ],
  },
  {
    sector: 'Healthcare',
    status: 'active',
    deadlineDays: 56,
    name: 'Care pathway digitization',
    description:
      'Unify bedside rounds, prescriptions, and follow-ups so residents see one timeline — improving handoffs across cardiology wards.',
    tasks: [
      { title: 'Clinician interview synthesis (12 personas)', status: 'done', priority: 'medium', deadlineOffset: -5 },
      { title: 'PHI tagging & residency consent flows', status: 'in-progress', priority: 'urgent', deadlineOffset: 6 },
      { title: 'EHR read-only adapters (Epic stubs)', status: 'todo', priority: 'high', deadlineOffset: 16 },
      { title: 'UAT bedside pilot — metrics dashboard', status: 'review', priority: 'medium', deadlineOffset: 22 },
      { title: 'Escalations queue for overdue follow-ups', status: 'todo', priority: 'low', deadlineOffset: 30 },
    ],
  },
  {
    sector: 'Education',
    status: 'on-hold',
    deadlineDays: 70,
    name: 'Regional LMS rollout accelerator',
    description:
      'Multi-language learning paths, moderated cohort messaging, plagiarism-safe assignment flows aimed at statewide adoption.',
    tasks: [
      { title: 'Content governance RACI finalized', status: 'done', priority: 'low', deadlineOffset: -8 },
      { title: 'Branding freeze — partner legal review pending', status: 'review', priority: 'high', deadlineOffset: -1 },
      { title: 'SSO bridging (Google / SAML mock)', status: 'todo', priority: 'medium', deadlineOffset: 25 },
      { title: 'Accessibility sweep (WCAG 2.1 AA)', status: 'todo', priority: 'high', deadlineOffset: 40 },
    ],
  },
  {
    sector: 'Manufacturing',
    status: 'active',
    deadlineDays: 33,
    name: 'Factory OEE uplift — Line 04',
    description:
      'Cut unplanned downtime on Line 04: tie IoT spindle signals to RCA tickets, SLA timers, maintenance crew assignments.',
    tasks: [
      { title: 'Edge gateway hardening sprint', status: 'in-progress', priority: 'urgent', deadlineOffset: 2 },
      { title: 'Downtime taxonomy + SLA matrix', status: 'todo', priority: 'high', deadlineOffset: 8 },
      { title: 'RCA template library for SMEs', status: 'review', priority: 'medium', deadlineOffset: 14 },
      { title: 'Operator shift handoff board', status: 'todo', priority: 'medium', deadlineOffset: 19 },
      { title: 'Pilot retrospective deck', status: 'done', priority: 'low', deadlineOffset: -3 },
    ],
  },
  {
    sector: 'Retail & CX',
    status: 'active',
    deadlineDays: 24,
    name: 'Holiday omnichannel escalation desk',
    description:
      'Blend chat, storefront returns, VIP routing into one prioritized queue — NPS uplift target +12 pts during peak weekends.',
    tasks: [
      { title: 'Queue merge rules experiment A/B spec', status: 'todo', priority: 'high', deadlineOffset: 3 },
      { title: 'Agent macro library refresh', status: 'in-progress', priority: 'medium', deadlineOffset: 7 },
      { title: 'VIP SLA breach alerts wiring', status: 'review', priority: 'high', deadlineOffset: 11 },
      { title: 'Post-mortem dashboard for peak Sundays', status: 'done', priority: 'low', deadlineOffset: -6 },
    ],
  },
  {
    sector: 'Technology / SaaS',
    status: 'completed',
    deadlineDays: -10,
    name: 'Realtime collaboration beta (TaskFlow-aligned)',
    description:
      'Ship conflict-free multiplayer cursors + optimistic edits for SaaS workspaces — aligns with flagship TaskFlow rollout narrative.',
    tasks: [
      { title: 'CRDT feasibility spike', status: 'done', priority: 'medium', deadlineOffset: -35 },
      { title: 'WebSocket failover harness', status: 'done', priority: 'urgent', deadlineOffset: -20 },
      { title: 'Growth cohort instrumentation', status: 'done', priority: 'low', deadlineOffset: -14 },
      { title: 'GA announcement + rollout notes', status: 'done', priority: 'low', deadlineOffset: -9 },
    ],
  },
  {
    sector: 'Logistics',
    status: 'active',
    deadlineDays: 61,
    name: 'Last-mile ETA confidence engine',
    description:
      'Blend carrier feeds, depot scans, rider GPS for realistic ETAs plus exceptions workflow for coordinators.',
    tasks: [
      { title: 'Truth layer for carrier vs depot timestamps', status: 'todo', priority: 'urgent', deadlineOffset: 10 },
      { title: 'Rider SLA heatmap POC', status: 'in-progress', priority: 'high', deadlineOffset: 17 },
      { title: 'Exception codes taxonomy', status: 'review', priority: 'medium', deadlineOffset: 25 },
      { title: 'Ops training micro-videos backlog', status: 'todo', priority: 'low', deadlineOffset: 34 },
      { title: 'Pilot dashboards for city hubs', status: 'todo', priority: 'medium', deadlineOffset: 48 },
    ],
  },
  {
    sector: 'Sustainability & ESG',
    status: 'active',
    deadlineDays: 91,
    name: 'Net-zero procurement intelligence',
    description:
      'Score suppliers on emissions + circularity KPIs embedded into RFP approvals with transparent audit stubs for board packs.',
    tasks: [
      { title: 'Emissions surrogate model validation', status: 'in-progress', priority: 'high', deadlineOffset: 20 },
      { title: 'Supplier scoring rubrics v2', status: 'todo', priority: 'medium', deadlineOffset: 31 },
      { title: 'Board narrative template pack', status: 'review', priority: 'low', deadlineOffset: 45 },
      { title: 'Data lineage documentation sprint', status: 'todo', priority: 'urgent', deadlineOffset: 55 },
      { title: 'Pilot with two strategic vendors', status: 'todo', priority: 'high', deadlineOffset: 73 },
    ],
  },
];

async function ensureMemberUser(client, plainPasswordHash, row) {
  const found = await client.query('SELECT id FROM users WHERE email = $1', [row.email]);
  if (found.rows[0]) return found.rows[0].id;
  const ins = await client.query(
    `INSERT INTO users (name, email, password, role, avatar) VALUES ($1, $2, $3, $4, $5) RETURNING id`,
    [row.name, row.email, plainPasswordHash, 'member', '👤']
  );
  return ins.rows[0].id;
}

/**
 * Seeds a professional cross-sector portfolio for the FIRST user account (sorted by id)
 * ONLY when zero projects exist. Safe to call on server boot + first signup.
 * @param {{ ownerId?: number }} [options]
 */
async function seedDemoPortfolioIfEligible(pool, options = {}) {
  if (process.env.DISABLE_AUTO_PORTFOLIO === '1' || process.env.DISABLE_AUTO_PORTFOLIO === 'true') {
    return;
  }

  const { rows: pc } = await pool.query('SELECT COUNT(*)::int AS c FROM projects');
  if (pc[0].c > 0) return;

  let ownerRow;
  if (options.ownerId != null) {
    const row = await pool.query('SELECT id, name FROM users WHERE id = $1', [options.ownerId]);
    ownerRow = row.rows[0];
  }
  if (!ownerRow) {
    const fallback = await pool.query('SELECT id, name FROM users ORDER BY id ASC LIMIT 1');
    ownerRow = fallback.rows[0];
  }
  if (!ownerRow) {
    console.log('ℹ️  Demo portfolio skipped (no accounts yet — sign up once, then refresh or restart).');
    return;
  }

  const ownerId = ownerRow.id;
  const hashed = await bcrypt.hash('PortfolioDemo!', 11);

  const client = await pool.connect();
  const collaboratorIds = [];

  try {
    await client.query('BEGIN');

    for (const m of TEAM) {
      collaboratorIds.push(await ensureMemberUser(client, hashed, m));
    }

    let assignIdx = 0;
    for (const proj of PORTFOLIO) {
      const dl = DAYS(proj.deadlineDays);

      const pRes = await client.query(
        `INSERT INTO projects (name, description, owner_id, deadline, status, sector)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
        [proj.name, proj.description, ownerId, dl, proj.status, proj.sector]
      );
      const projectId = pRes.rows[0].id;

      await client.query(
        `INSERT INTO project_members (project_id, user_id, role) VALUES ($1, $2, $3)
         ON CONFLICT (project_id, user_id) DO NOTHING`,
        [projectId, ownerId, 'admin']
      );

      const memberPool = collaboratorIds.slice();
      for (const cid of memberPool) {
        await client.query(
          `INSERT INTO project_members (project_id, user_id, role) VALUES ($1, $2, $3)
           ON CONFLICT (project_id, user_id) DO NOTHING`,
          [projectId, cid, 'member']
        );
      }

      for (const t of proj.tasks) {
        const assignees = collaboratorIds.filter(Boolean);
        const assign = assignees.length ? assignees[assignIdx++ % assignees.length] : null;
        const taskDeadline = typeof t.deadlineOffset === 'number' ? DAYS(t.deadlineOffset) : null;

        await client.query(
          `INSERT INTO tasks (title, description, status, priority, project_id, assigned_to, created_by, deadline)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [
            t.title,
            t.description || null,
            t.status,
            t.priority || 'medium',
            projectId,
            assign || null,
            ownerId,
            taskDeadline,
          ]
        );
      }
    }

    await client.query('COMMIT');
    console.log(
      `✅ Demo portfolio seeded: ${PORTFOLIO.length} sectors, ${collaboratorIds.length} collaborator accounts (password: PortfolioDemo!), owner: ${ownerRow.name}`
    );
  } catch (e) {
    await client.query('ROLLBACK');
    console.error('❌ Demo portfolio seed failed:', e.message);
    throw e;
  } finally {
    client.release();
  }
}

module.exports = { seedDemoPortfolioIfEligible };

if (require.main === module) {
  require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
  const { initDB, pool } = require('./config/database');
  (async () => {
    try {
      await initDB();
      await seedDemoPortfolioIfEligible(pool);
    } catch (_) {
      process.exitCode = 1;
    } finally {
      await pool.end();
    }
  })();
}
