import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

function CreateProjectModal({ onClose, onCreated }) {
  const [form, setForm] = useState({ name: '', description: '', deadline: '' });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!form.name.trim()) { toast('Project name is required', 'error'); return; }
    setLoading(true);
    try {
      const r = await api.post('/projects', form);
      toast('Project created! 🎉', 'success');
      onCreated(r.data.project);
    } catch (e) {
      toast(e.response?.data?.error || 'Failed to create project', 'error');
    } finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>📁 New Project</h2>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="form-group">
            <label className="label">Project Name *</label>
            <input className="input" placeholder="e.g. Website Redesign" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
          </div>
          <div className="form-group">
            <label className="label">Description</label>
            <textarea className="input" placeholder="What's this project about?" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} style={{ minHeight: 80 }} />
          </div>
          <div className="form-group">
            <label className="label">Deadline</label>
            <input className="input" type="date" value={form.deadline} onChange={e => setForm(p => ({ ...p, deadline: e.target.value }))} />
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
            {loading ? <span className="spinner" /> : 'Create Project'}
          </button>
        </div>
      </div>
    </div>
  );
}

const statusColors = { active: 'green', completed: 'blue', 'on-hold': 'yellow' };

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState('all');
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    api.get('/projects').then(r => setProjects(r.data.projects)).finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'all' ? projects : projects.filter(p => p.status === filter);

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '50vh', gap: 12 }}>
      <div className="spinner" style={{ width: 32, height: 32 }} /> <span style={{ color: 'var(--text2)' }}>Loading projects...</span>
    </div>
  );

  return (
    <div className="animate-fade">
      <div className="page-header">
        <div>
          <h1 className="page-title">Projects</h1>
          <p className="page-subtitle">{projects.length} projects you're part of</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ New Project</button>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {['all', 'active', 'completed', 'on-hold'].map(s => (
          <button key={s} className={`btn ${filter === s ? 'btn-primary' : 'btn-ghost'} btn-sm`}
            onClick={() => setFilter(s)}>
            {s === 'all' ? 'All' : s === 'on-hold' ? 'On Hold' : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="icon">📁</div>
          <h3>No projects found</h3>
          <p>Create your first project to get started with your team.</p>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>Create Project</button>
        </div>
      ) : (
        <div className="grid-3">
          {filtered.map(p => {
            const pct = p.task_count > 0 ? Math.round((p.completed_tasks / p.task_count) * 100) : 0;
            const isOverdue = p.deadline && new Date(p.deadline) < new Date() && p.status !== 'completed';
            return (
              <div key={p.id} className="card card-hover" style={{ cursor: 'pointer', padding: '20px' }} onClick={() => navigate(`/projects/${p.id}`)}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div style={{ fontSize: '28px' }}>📁</div>
                  <span className={`badge badge-${statusColors[p.status]}`}>{p.status}</span>
                </div>
                <h3 style={{ fontSize: '16px', marginBottom: '6px' }}>{p.name}</h3>
                {p.description && <p style={{ fontSize: '13px', color: 'var(--text2)', marginBottom: '14px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{p.description}</p>}
                <div className="progress-bar" style={{ marginBottom: '10px', marginTop: 'auto' }}>
                  <div className="progress-fill" style={{ width: `${pct}%` }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: '12px', color: 'var(--text3)' }}>{p.completed_tasks}/{p.task_count} tasks • {p.member_count} members</div>
                  <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--accent)' }}>{pct}%</span>
                </div>
                {p.deadline && (
                  <div style={{ fontSize: '11px', marginTop: '8px', color: isOverdue ? 'var(--red)' : 'var(--text3)' }}>
                    {isOverdue ? '🚨 Overdue' : '📅'} {new Date(p.deadline).toLocaleDateString()}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {showModal && <CreateProjectModal onClose={() => setShowModal(false)} onCreated={p => { setProjects(prev => [p, ...prev]); setShowModal(false); }} />}
    </div>
  );
}
