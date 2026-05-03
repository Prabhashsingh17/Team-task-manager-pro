import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import Sidebar from './components/Sidebar';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import ProjectsPage from './pages/ProjectsPage';
import ProjectDetail from './pages/ProjectDetail';
import MyTasksPage from './pages/MyTasksPage';

function ProtectedLayout({ children }) {
  const { user, loading } = useAuth();
  
  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', gap: 12, flexDirection: 'column' }}>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800 }}>
        Task<span style={{ color: 'var(--accent)' }}>Flow</span>
      </div>
      <div className="spinner" style={{ width: 32, height: 32 }} />
    </div>
  );
  
  if (!user) return <Navigate to="/auth" replace />;
  
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">{children}</main>
    </div>
  );
}

function AppRoutes() {
  const { user } = useAuth();
  
  return (
    <Routes>
      <Route path="/auth" element={user ? <Navigate to="/dashboard" /> : <AuthPage />} />
      <Route path="/dashboard" element={<ProtectedLayout><Dashboard /></ProtectedLayout>} />
      <Route path="/projects" element={<ProtectedLayout><ProjectsPage /></ProtectedLayout>} />
      <Route path="/projects/:id" element={<ProtectedLayout><ProjectDetail /></ProtectedLayout>} />
      <Route path="/my-tasks" element={<ProtectedLayout><MyTasksPage /></ProtectedLayout>} />
      <Route path="/" element={<Navigate to="/dashboard" />} />
      <Route path="*" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}
