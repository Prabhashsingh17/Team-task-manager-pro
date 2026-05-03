import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { sectorVisual } from '../utils/sectors';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

const STATUSES = ['todo', 'in-progress', 'review', 'done'];
const STATUS_LABELS = { todo: '📋 To Do', 'in-progress': '⚡ In Progress', review: '🔍 In Review', done: '✅ Done' };
const STATUS_COLORS = { todo: 'text3', 'in-progress': 'blue', review: 'yellow', done: 'green' };
const PRIORITIES = ['low', 'medium', 'high', 'urgent'];

function TaskModal({ task, project, members, onClose, onUpdated, onDeleted }) {
  const [form, setForm] = useState({
    title: task?.title || '',
    description: task?.description || '',
    status: task?.status || 'todo',
    priority: task?.priority || 'medium',
    assigned_to: task?.assigned_to || '',
    deadline: task?.deadline ? task.deadline.split('T')[0] : '',
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const isNew = !task;

  const handleSave = async () => {
    if (!form.title.trim()) { toast('Title required', 'error'); return; }
    setLoading(true);
    try {
      if (isNew) {
        const r = await api.post(`/projects/${project.id}/tasks`, form);
        onUpdated(r.data.task, true);
        toast('Task created!', 'success');
      } else {
        const r = await api.put(`/tasks/${task.id}`, form);
        onUpdated(r.data.task, false);
        toast('Task updated!', 'success');
      }
      onClose();
    } catch (e) {
      toast(e.response?.data?.error || 'Error saving task', 'error');
    } finally { setLoading(false); }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this task?')) return;
    try {
      await api.delete(`/tasks/${task.id}`);
      onDeleted(task.id);
      toast('Task deleted', 'info');
      onClose();
    } catch (e) { toast('Failed to delete', 'error'); }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 560 }}>
        <div className="modal-header">
          <h2>{isNew ? '➕ New Task' : '✏️ Edit Task'}</h2>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className="form-group">
            <label className="label">Title *</label>
            <input className="input" placeholder="Task title" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
          </div>
          <div className="form-group">
            <label className="label">Description</label>
            <textarea className="input" placeholder="Details..." value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} style={{ minHeight: 80 }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="label">Status</label>
              <select className="input" value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
                {STATUSES.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="label">Priority</label>
              <select className="input" value={form.priority} onChange={e => setForm(p => ({ ...p, priority: e.target.value }))}>
                {PRIORITIES.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="label">Assign To</label>
              <select className="input" value={form.assigned_to} onChange={e => setForm(p => ({ ...p, assigned_to: e.target.value }))}>
                <option value="">Unassigned</option>
                {members.map(m => <option key={m.id} value={m.id}>{m.avatar} {m.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="label">Deadline</label>
              <input className="input" type="date" value={form.deadline} onChange={e => setForm(p => ({ ...p, deadline: e.target.value }))} />
            </div>
          </div>
        </div>
        <div className="modal-footer">
          {!isNew && <button className="btn btn-danger btn-sm" onClick={handleDelete}>Delete</button>}
          <div style={{ flex: 1 }} />
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={loading}>
            {loading ? <span className="spinner" /> : isNew ? 'Create Task' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

function AddMemberModal({ projectId, onClose, onAdded }) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('member');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleAdd = async () => {
    if (!email) return;
    setLoading(true);
    try {
      await api.post(`/projects/${projectId}/members`, { email, role });
      toast('Member added!', 'success');
      onAdded();
      onClose();
    } catch (e) {
      toast(e.response?.data?.error || 'Failed to add member', 'error');
    } finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 420 }}>
        <div className="modal-header">
          <h2>👥 Add Member</h2>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="form-group">
            <label className="label">Member Email</label>
            <input className="input" type="email" placeholder="member@company.com" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="label">Role in Project</label>
            <select className="input" value={role} onChange={e => setRole(e.target.value)}>
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleAdd} disabled={loading}>
            {loading ? <span className="spinner" /> : 'Add Member'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ProjectDetail() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [taskModal, setTaskModal] = useState(null);
  const [addMember, setAddMember] = useState(false);
  const [view, setView] = useState('kanban');
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const load = () => {
    setLoading(true);
    api.get(`/projects/${id}`).then(r => setData(r.data)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [id]);

  const handleTaskUpdated = (task, isNew) => {
    setData(prev => ({
      ...prev,
      tasks: isNew ? [task, ...prev.tasks] : prev.tasks.map(t => t.id === task.id ? task : t),
    }));
  };

  const handleTaskDeleted = (taskId) => {
    setData(prev => ({ ...prev, tasks: prev.tasks.filter(t => t.id !== taskId) }));
  };

  const handleDeleteProject = async () => {
    if (!confirm('Delete this project and all its tasks?')) return;
    try {
      await api.delete(`/projects/${id}`);
      toast('Project deleted', 'info');
      navigate('/projects');
    } catch (e) { toast('Failed to delete project', 'error'); }
  };

  const handleRemoveMember = async (userId) => {
    if (!confirm('Remove this member?')) return;
    try {
      await api.delete(`/projects/${id}/members/${userId}`);
      setData(prev => ({ ...prev, members: prev.members.filter(m => m.id !== userId) }));
      toast('Member removed', 'info');
    } catch (e) { toast('Failed to remove member', 'error'); }
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '50vh', gap: 12 }}>
      <div className="spinner" style={{ width: 32, height: 32 }} /> <span style={{ color: 'var(--text2)' }}>Loading project...</span>
    </div>
  );

  if (!data) return <div className="empty-state"><div className="icon">🚫</div><h3>Project not found</h3></div>;

  const { project, members, tasks } = data;
  const pct = project.task_count > 0 ? Math.round((project.completed_tasks / project.task_count) * 100) : 0;
  const isAdmin = user?.role === 'admin' || project.owner_id === user?.id;
  const sec = sectorVisual(project.sector);

  return (
    <div className="animate-fade">
      {/* Header */}
      <div className="page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6, flexWrap: 'wrap' }}>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/projects')}>← Back</button>
            {project.sector && (
              <span
                className="chip"
                style={{
                  fontWeight: 600,
                  border: `1px solid ${sec.border}`,
                  background: sec.accent,
                  color: 'var(--text)',
                }}
              >
                {sec.icon} {project.sector}
              </span>
            )}
            <span className={`badge badge-${project.status === 'active' ? 'done' : project.status === 'completed' ? 'in-progress' : 'review'}`}>{project.status}</span>
          </div>
          <h1 className="page-title">{project.name}</h1>
          {project.description && <p className="page-subtitle">{project.description}</p>}
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button className="btn btn-primary" onClick={() => setTaskModal({})}>+ Add Task</button>
          {isAdmin && <button className="btn btn-ghost" onClick={() => setAddMember(true)}>👥 Add Member</button>}
          {isAdmin && <button className="btn btn-danger btn-sm" onClick={handleDeleteProject}>🗑</button>}
        </div>
      </div>

      {/* Stats row */}
      <div className="grid-4" style={{ marginBottom: 24 }}>
        {[
          { label: 'Total Tasks', value: project.task_count, icon: '📋' },
          { label: 'Completed', value: project.completed_tasks, icon: '✅' },
          { label: 'Members', value: members.length, icon: '👥' },
          { label: 'Progress', value: `${pct}%`, icon: '📈' },
        ].map((s, i) => (
          <div key={i} className="card stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <div className="stat-label">{s.label}</div>
              <span style={{ fontSize: 20 }}>{s.icon}</span>
            </div>
            <div className="stat-value" style={{ fontSize: 24 }}>{s.value}</div>
            {i === 3 && <div className="progress-bar" style={{ marginTop: 8 }}><div className="progress-fill" style={{ width: `${pct}%` }} /></div>}
          </div>
        ))}
      </div>

      {/* View toggle */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        <button className={`btn ${view === 'kanban' ? 'btn-primary' : 'btn-ghost'} btn-sm`} onClick={() => setView('kanban')}>🗂 Kanban</button>
        <button className={`btn ${view === 'list' ? 'btn-primary' : 'btn-ghost'} btn-sm`} onClick={() => setView('list')}>📋 List</button>
        <button className={`btn ${view === 'members' ? 'btn-primary' : 'btn-ghost'} btn-sm`} onClick={() => setView('members')}>👥 Members</button>
      </div>

      {/* Kanban Board */}
      {view === 'kanban' && (
        <div className="kanban-board">
          {STATUSES.map(status => {
            const colTasks = tasks.filter(t => t.status === status);
            return (
              <div key={status} className="kanban-col">
                <div className="kanban-col-header">
                  <span className="kanban-col-title" style={{ color: `var(--${STATUS_COLORS[status]})` }}>{STATUS_LABELS[status]}</span>
                  <span className="badge" style={{ background: 'var(--bg2)', color: 'var(--text2)', fontSize: 11 }}>{colTasks.length}</span>
                </div>
                {colTasks.map(task => {
                  const isOverdue = task.deadline && new Date(task.deadline) < new Date() && task.status !== 'done';
                  return (
                    <div key={task.id} className={`task-card ${isOverdue ? 'overdue-bg' : ''}`} onClick={() => setTaskModal(task)}>
                      <div className="task-card-title">{task.title}</div>
                      <div className="task-card-meta">
                        <span className={`badge badge-${task.priority}`}>{task.priority}</span>
                        {task.assignee_avatar && <div className="avatar avatar-sm">{task.assignee_avatar}</div>}
                      </div>
                      {task.deadline && (
                        <div style={{ fontSize: 11, marginTop: 6, color: isOverdue ? 'var(--red)' : 'var(--text3)' }}>
                          {isOverdue ? '🚨' : '📅'} {new Date(task.deadline).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  );
                })}
                <button className="btn btn-ghost btn-sm" style={{ width: '100%', justifyContent: 'center', marginTop: 8, fontSize: 12 }}
                  onClick={() => setTaskModal({ status })}>+ Add</button>
              </div>
            );
          })}
        </div>
      )}

      {/* List View */}
      {view === 'list' && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {tasks.length === 0 ? (
            <div className="empty-state"><div className="icon">📋</div><h3>No tasks yet</h3><button className="btn btn-primary btn-sm" onClick={() => setTaskModal({})}>Add Task</button></div>
          ) : tasks.map((task, i) => {
            const isOverdue = task.deadline && new Date(task.deadline) < new Date() && task.status !== 'done';
            return (
              <div key={task.id} className={`${isOverdue ? 'overdue-bg' : ''}`}
                style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '14px 20px', borderBottom: i < tasks.length - 1 ? '1px solid var(--border)' : 'none', cursor: 'pointer', transition: 'var(--transition)' }}
                onClick={() => setTaskModal(task)}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 500, fontSize: 14 }}>{task.title}</div>
                  {task.assignee_name && <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>{task.assignee_avatar} {task.assignee_name}</div>}
                </div>
                <span className={`badge badge-${task.priority}`}>{task.priority}</span>
                <span className={`badge badge-${task.status}`}>{STATUS_LABELS[task.status]}</span>
                {task.deadline && <span style={{ fontSize: 12, color: isOverdue ? 'var(--red)' : 'var(--text3)', whiteSpace: 'nowrap' }}>{isOverdue ? '🚨' : '📅'} {new Date(task.deadline).toLocaleDateString()}</span>}
              </div>
            );
          })}
        </div>
      )}

      {/* Members View */}
      {view === 'members' && (
        <div className="grid-3">
          {members.map(m => (
            <div key={m.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div className="avatar avatar-lg">{m.avatar}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600 }}>{m.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text3)' }}>{m.email}</div>
                <span className={`badge ${m.role === 'admin' ? 'badge-done' : 'badge-todo'}`} style={{ marginTop: 4 }}>{m.role === 'admin' ? '👑 Admin' : '👤 Member'}</span>
              </div>
              {isAdmin && m.id !== user.id && (
                <button className="btn btn-danger btn-icon btn-sm" onClick={() => handleRemoveMember(m.id)}>✕</button>
              )}
            </div>
          ))}
        </div>
      )}

      {taskModal !== null && (
        <TaskModal
          task={Object.keys(taskModal).length === 0 || taskModal.status ? null : taskModal}
          project={project}
          members={members}
          onClose={() => setTaskModal(null)}
          onUpdated={handleTaskUpdated}
          onDeleted={handleTaskDeleted}
        />
      )}

      {addMember && <AddMemberModal projectId={id} onClose={() => setAddMember(false)} onAdded={load} />}
    </div>
  );
}
