import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

const STATUS_LABELS = { todo: '📋 To Do', 'in-progress': '⚡ In Progress', review: '🔍 Review', done: '✅ Done' };

export default function MyTasksPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/dashboard').then(r => {
      // Combine my tasks from dashboard
      setTasks(r.data.myTasks || []);
    }).finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'all' ? tasks :
    filter === 'overdue' ? tasks.filter(t => t.deadline && new Date(t.deadline) < new Date()) :
    tasks.filter(t => t.status === filter);

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '50vh', gap: 12 }}>
      <div className="spinner" style={{ width: 32, height: 32 }} /> <span style={{ color: 'var(--text2)' }}>Loading tasks...</span>
    </div>
  );

  return (
    <div className="animate-fade">
      <div className="page-header">
        <div>
          <h1 className="page-title">My Tasks</h1>
          <p className="page-subtitle">{tasks.length} tasks assigned to you</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        {['all', 'todo', 'in-progress', 'review', 'overdue'].map(f => (
          <button key={f} className={`btn ${filter === f ? 'btn-primary' : 'btn-ghost'} btn-sm`} onClick={() => setFilter(f)}>
            {f === 'all' ? 'All' : f === 'overdue' ? '🚨 Overdue' : STATUS_LABELS[f]}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="icon">{filter === 'overdue' ? '🎉' : '✅'}</div>
          <h3>{filter === 'overdue' ? 'No overdue tasks!' : 'No tasks here'}</h3>
          <p>{filter === 'overdue' ? 'You\'re on top of everything.' : 'Tasks assigned to you will appear here.'}</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map(task => {
            const isOverdue = task.deadline && new Date(task.deadline) < new Date() && task.status !== 'done';
            return (
              <div key={task.id} className={`card card-hover ${isOverdue ? 'overdue-bg' : ''}`}
                style={{ cursor: 'pointer', padding: '16px 20px' }}
                onClick={() => navigate(`/projects/${task.project_id || task.task?.project_id}`)}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>{task.title}</div>
                    <div style={{ fontSize: 13, color: 'var(--text3)' }}>📁 {task.project_name}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                    <span className={`badge badge-${task.priority}`}>{task.priority}</span>
                    <span className={`badge badge-${task.status}`}>{STATUS_LABELS[task.status]}</span>
                    {task.deadline && (
                      <span style={{ fontSize: 12, color: isOverdue ? 'var(--red)' : 'var(--text3)', whiteSpace: 'nowrap' }}>
                        {isOverdue ? '🚨' : '📅'} {new Date(task.deadline).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
