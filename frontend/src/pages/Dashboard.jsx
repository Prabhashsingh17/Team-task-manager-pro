import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const priorityColor = { low: 'green', medium: 'blue', high: 'yellow', urgent: 'red' };
const statusLabels = { todo: 'To Do', 'in-progress': 'In Progress', review: 'In Review', done: 'Done' };

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/dashboard').then(r => setData(r.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '50vh', gap: '12px' }}>
      <div className="spinner" style={{ width: 32, height: 32 }} />
      <span style={{ color: 'var(--text2)' }}>Loading dashboard...</span>
    </div>
  );

  const totalTasks = data?.tasksByStatus?.reduce((a, b) => a + parseInt(b.count), 0) || 0;
  const doneTasks = parseInt(data?.tasksByStatus?.find(t => t.status === 'done')?.count || 0);
  const inProgress = parseInt(data?.tasksByStatus?.find(t => t.status === 'in-progress')?.count || 0);

  return (
    <div className="animate-fade">
      <div className="page-header">
        <div>
          <h1 className="page-title">Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, {user?.name?.split(' ')[0]} {user?.avatar}</h1>
          <p className="page-subtitle">Here's what's happening with your projects today.</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid-4" style={{ marginBottom: '28px' }}>
        {[
          { label: 'Total Tasks', value: totalTasks, icon: '📋', sub: 'across all projects' },
          { label: 'Completed', value: doneTasks, icon: '✅', sub: `${totalTasks ? Math.round(doneTasks/totalTasks*100) : 0}% completion rate` },
          { label: 'In Progress', value: inProgress, icon: '⚡', sub: 'active tasks' },
          { label: 'Overdue', value: data?.overdueTasks || 0, icon: '🚨', sub: 'need attention', urgent: true },
        ].map((stat, i) => (
          <div key={i} className={`card stat-card ${stat.urgent && stat.value > 0 ? 'overdue-bg' : ''}`}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div className="stat-label">{stat.label}</div>
              <span style={{ fontSize: '24px' }}>{stat.icon}</span>
            </div>
            <div className={`stat-value ${stat.urgent && stat.value > 0 ? 'overdue' : ''}`}>{stat.value}</div>
            <div className="stat-change">{stat.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
        {/* Projects */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '16px' }}>📁 Active Projects</h2>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/projects')}>View all</button>
          </div>
          {data?.projects?.length === 0 ? (
            <div className="empty-state" style={{ padding: '30px' }}>
              <div className="icon">📁</div>
              <h3>No projects yet</h3>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {data?.projects?.map(p => {
                const pct = p.total_tasks > 0 ? Math.round((p.done_tasks / p.total_tasks) * 100) : 0;
                return (
                  <div key={p.id} className="card card-hover" style={{ padding: '14px', cursor: 'pointer' }} onClick={() => navigate(`/projects/${p.id}`)}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontSize: '14px', fontWeight: '600' }}>{p.name}</span>
                      <span className="chip">{p.member_count} members</span>
                    </div>
                    <div className="progress-bar" style={{ marginBottom: '6px' }}>
                      <div className="progress-fill" style={{ width: `${pct}%` }} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text3)' }}>
                      <span>{p.done_tasks}/{p.total_tasks} tasks done</span>
                      <span>{pct}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* My Tasks */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '16px' }}>✅ Assigned to Me</h2>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/my-tasks')}>View all</button>
          </div>
          {data?.myTasks?.length === 0 ? (
            <div className="empty-state" style={{ padding: '30px' }}>
              <div className="icon">🎉</div>
              <h3>All caught up!</h3>
              <p>No tasks assigned to you</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {data?.myTasks?.slice(0, 5).map(t => {
                const isOverdue = t.deadline && new Date(t.deadline) < new Date();
                return (
                  <div key={t.id} className={`card ${isOverdue ? 'overdue-bg' : ''}`} style={{ padding: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: '500', marginBottom: '4px' }}>{t.title}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text3)' }}>{t.project_name}</div>
                      </div>
                      <span className={`badge badge-${t.priority}`}>{t.priority}</span>
                    </div>
                    {t.deadline && (
                      <div style={{ fontSize: '11px', marginTop: '6px', color: isOverdue ? 'var(--red)' : 'var(--text3)' }}>
                        {isOverdue ? '🚨' : '📅'} {new Date(t.deadline).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <h2 style={{ fontSize: '16px', marginBottom: '20px' }}>⚡ Recent Activity</h2>
        {data?.recentActivity?.length === 0 ? (
          <div className="empty-state" style={{ padding: '30px' }}>
            <div className="icon">📭</div>
            <h3>No recent activity</h3>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {data?.recentActivity?.map((item, i) => (
              <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '12px 0', borderBottom: i < data.recentActivity.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--bg3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>
                  {item.status === 'done' ? '✅' : item.status === 'in-progress' ? '⚡' : '📋'}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '14px', fontWeight: '500' }}>{item.title}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text3)' }}>{item.project_name}</div>
                </div>
                <span className={`badge badge-${item.status}`}>{statusLabels[item.status]}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
