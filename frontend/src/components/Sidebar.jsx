import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/auth'); };

  const navItems = [
    { to: '/dashboard', icon: '📊', label: 'Dashboard' },
    { to: '/projects', icon: '📁', label: 'Projects' },
    { to: '/my-tasks', icon: '✅', label: 'My Tasks' },
  ];

  if (user?.role === 'admin') {
    navItems.push({ to: '/team', icon: '👥', label: 'Team' });
  }

  return (
    <aside className="sidebar">
      <div style={{ padding: '8px 8px 20px', borderBottom: '1px solid var(--border)', marginBottom: '8px' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: '800', color: 'var(--text)' }}>
          Task<span style={{ color: 'var(--accent)' }}>Flow</span>
        </div>
        <div style={{ fontSize: '11px', color: 'var(--text3)', marginTop: '2px' }}>Team Task Manager</div>
      </div>

      <nav style={{ flex: 1 }}>
        {navItems.map(item => (
          <NavLink key={item.to} to={item.to} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <span className="nav-icon">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px', marginTop: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', borderRadius: '10px', background: 'var(--bg3)', marginBottom: '10px' }}>
          <div className="avatar" style={{ fontSize: '18px' }}>{user?.avatar}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name}</div>
            <div style={{ fontSize: '11px', color: 'var(--accent)', textTransform: 'capitalize' }}>
              {user?.role === 'admin' ? '👑 Admin' : '👤 Member'}
            </div>
          </div>
        </div>
        <button className="nav-item" onClick={handleLogout} style={{ color: 'var(--red)', width: '100%' }}>
          <span className="nav-icon">🚪</span> Sign Out
        </button>
      </div>
    </aside>
  );
}
