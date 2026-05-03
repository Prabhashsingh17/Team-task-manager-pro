import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function AuthPage() {
  const [tab, setTab] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'member' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login, signup } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const set = (k, v) => { setForm(p => ({ ...p, [k]: v })); setError(''); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (tab === 'login') {
        await login(form.email, form.password);
      } else {
        if (!form.name.trim()) { setError('Name is required'); setLoading(false); return; }
        await signup(form.name, form.email, form.password, form.role);
      }
      toast('Welcome to TaskFlow! 🚀', 'success');
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card animate-fade">
        <div className="auth-logo">Task<span>Flow</span></div>
        <div className="auth-tagline">The modern workspace for high-performing teams</div>

        <div className="card" style={{ padding: '32px' }}>
          <div className="tabs" style={{ marginBottom: '24px' }}>
            <button className={`tab ${tab === 'login' ? 'active' : ''}`} onClick={() => { setTab('login'); setError(''); }}>Sign In</button>
            <button className={`tab ${tab === 'signup' ? 'active' : ''}`} onClick={() => { setTab('signup'); setError(''); }}>Sign Up</button>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {tab === 'signup' && (
              <div className="form-group">
                <label className="label">Full Name</label>
                <input className="input" placeholder="Alex Johnson" value={form.name} onChange={e => set('name', e.target.value)} />
              </div>
            )}

            <div className="form-group">
              <label className="label">Email Address</label>
              <input className="input" type="email" placeholder="alex@company.com" value={form.email} onChange={e => set('email', e.target.value)} required />
            </div>

            <div className="form-group">
              <label className="label">Password</label>
              <input className="input" type="password" placeholder={tab === 'signup' ? 'Min. 6 characters' : '••••••••'} value={form.password} onChange={e => set('password', e.target.value)} required />
            </div>

            {tab === 'signup' && (
              <div className="form-group">
                <label className="label">Account Role</label>
                <select className="input" value={form.role} onChange={e => set('role', e.target.value)}>
                  <option value="member">👥 Member</option>
                  <option value="admin">👑 Admin</option>
                </select>
              </div>
            )}

            {error && <div className="error-msg">⚠️ {error}</div>}

            <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: '100%', justifyContent: 'center', padding: '14px', marginTop: '4px' }}>
              {loading ? <span className="spinner" /> : tab === 'login' ? 'Sign In →' : 'Create Account →'}
            </button>
          </form>

          {tab === 'login' && (
            <p style={{ textAlign: 'center', fontSize: '13px', color: 'var(--text3)', marginTop: '20px' }}>
              Demo: <strong style={{ color: 'var(--text2)' }}>admin@demo.com</strong> / <strong style={{ color: 'var(--text2)' }}>demo123</strong>
            </p>
          )}
        </div>

        <p style={{ textAlign: 'center', fontSize: '13px', color: 'var(--text3)', marginTop: '20px' }}>
          {tab === 'login' ? "Don't have an account? " : "Already have an account? "}
          <span style={{ color: 'var(--accent)', cursor: 'pointer' }} onClick={() => { setTab(tab === 'login' ? 'signup' : 'login'); setError(''); }}>
            {tab === 'login' ? 'Sign up free' : 'Sign in'}
          </span>
        </p>
      </div>
    </div>
  );
}
