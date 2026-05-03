import { useNavigate } from 'react-router-dom';

const demoSteps = [
  { title: '1. Authentication', detail: 'Sign up → Login (JWT-based session).' },
  { title: '2. Dashboard', detail: 'Open Dashboard — totals, overdue, recent tasks, workload snapshot.' },
  { title: '3. Projects', detail: 'Create a project → set name, description, deadline, status.' },
  { title: '4. Kanban', detail: 'Open a project → add tasks → move columns To Do → In Progress → Review → Done.' },
  { title: '5. Collaboration', detail: '(Admin) Invite member by email, set project Admin/Member. (Member) work on assigned tasks.' },
  { title: '6. My Tasks', detail: 'Across projects, see tasks assigned to the logged-in user.' },
];

const stacks = [
  { label: 'Frontend', value: 'React 18 · Vite · React Router' },
  { label: 'Backend', value: 'Node.js · Express · REST APIs' },
  { label: 'Database', value: 'PostgreSQL (relationships + validation)' },
  { label: 'Security', value: 'JWT + bcrypt · Role-based access (global + project)' },
];

const assignmentBullets = [
  'Signup / Login',
  'Projects & team members',
  'Tasks — create, assign, status workflow',
  'Dashboard — overview & overdue highlighting',
  'RBAC — Admin vs Member behaviours',
];

export default function CoordinatorBrief() {
  const navigate = useNavigate();

  return (
    <div className="animate-fade">
      <div className="page-header">
        <div>
          <h1 className="page-title">📣 Demo Guide (Coordinator briefing)</h1>
          <p className="page-subtitle">
            Neeche wale points screen share karte waqt follow kar lo — short, clear, assignment-aligned.
          </p>
        </div>
        <button type="button" className="btn btn-primary btn-sm" onClick={() => navigate('/projects')}>
          Start demo → Projects
        </button>
      </div>

      <div className="card" style={{ marginBottom: '20px', borderLeft: '4px solid var(--accent)', padding: '20px 24px' }}>
        <h2 style={{ fontSize: '16px', marginBottom: '10px' }}>30-second pitch</h2>
        <p style={{ color: 'var(--text2)', fontSize: '14px', lineHeight: 1.7 }}>
          <strong>TaskFlow</strong> ek team task manager hai: projects banate ho, members add karte ho, tasks Kanban columns me
          track karte ho, aur <strong>role-based permissions</strong> se admin controls team structure, member apne assignments pe focus karta hai.
          Backend <strong>REST APIs</strong> + Postgres; auth <strong>JWT</strong> se secured hai.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        <div className="card">
          <h2 style={{ fontSize: '16px', marginBottom: '14px' }}>✅ Assignment expectations</h2>
          <ul style={{ color: 'var(--text2)', fontSize: '14px', paddingLeft: '20px', lineHeight: 1.85 }}>
            {assignmentBullets.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div className="card">
          <h2 style={{ fontSize: '16px', marginBottom: '14px' }}>🛠 Tech stack</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {stacks.map((row) => (
              <div key={row.label} style={{ paddingBottom: '10px', borderBottom: '1px solid var(--border)' }}>
                <div style={{ fontSize: '12px', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  {row.label}
                </div>
                <div style={{ fontSize: '14px', color: 'var(--text)', marginTop: '4px' }}>{row.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '16px', marginBottom: '16px' }}>🎯 ~4 minute demo script</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {demoSteps.map((step) => (
            <div
              key={step.title}
              style={{
                display: 'flex',
                gap: '14px',
                alignItems: 'flex-start',
                padding: '14px',
                background: 'var(--bg3)',
                borderRadius: 'var(--radius)',
                border: '1px solid var(--border)',
              }}
            >
              <span className="chip" style={{ flexShrink: 0 }}>
                {step.title.split('.')[0]}
              </span>
              <div>
                <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '4px' }}>{step.title.replace(/^\d+\.\s*/, '')}</div>
                <div style={{ fontSize: '13px', color: 'var(--text2)', lineHeight: 1.65 }}>{step.detail}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        <div className="card">
          <h2 style={{ fontSize: '16px', marginBottom: '12px' }}>👑 Admin vs 👤 Member</h2>
          <p style={{ fontSize: '13px', color: 'var(--text2)', lineHeight: 1.75, marginBottom: '12px' }}>
            Project par <strong>Admin</strong> members add/remove aur structure control kar sakta hai; <strong>Member</strong> tasks assigned
            workflow me kaam karta hai. Interview me kah sakte ho: permissions API + middleware layer pe enforce ho rahe hain.
          </p>
          <div style={{ fontSize: '12px', color: 'var(--text3)' }}>
            Tip: demo ke liye ek admin aur ek member account bana kar dono perspectives dikhayo.
          </div>
        </div>
        <div className="card">
          <h2 style={{ fontSize: '16px', marginBottom: '12px' }}>📤 Submission reminders</h2>
          <ul style={{ color: 'var(--text2)', fontSize: '14px', paddingLeft: '20px', lineHeight: 1.85 }}>
            <li><strong>Live URL</strong> — usually frontend Railway link</li>
            <li><strong>GitHub repo</strong> — `backend/` + `frontend/` + README</li>
            <li><strong>Demo video</strong> — auth → project → Kanban → dashboard (2–5 min)</li>
          </ul>
        </div>
      </div>

      <p style={{ fontSize: '13px', color: 'var(--text3)', textAlign: 'center' }}>
        Local run: Frontend <strong style={{ color: 'var(--text2)' }}>localhost:5173</strong> · Backend health{' '}
        <strong style={{ color: 'var(--text2)' }}>localhost:5000/health</strong>
      </p>
    </div>
  );
}
