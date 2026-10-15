import { lazy, Suspense } from 'react';
import { Link, Navigate, Route, Routes } from 'react-router-dom';
import { Button, Result, Spin } from 'antd';
import { useAuth } from './context/AuthContext';
import AppLayout from './components/AppLayout';
import Landing from './pages/Landing';
import { ForgotPasswordPage, LoginPage, RegisterPage } from './pages/AuthPages';

// Signed-in pages load on demand, so the landing and login pages open fast.
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Transactions = lazy(() => import('./pages/Transactions'));
const Budgets = lazy(() => import('./pages/Budgets'));
const Recurring = lazy(() => import('./pages/Recurring'));
const Categories = lazy(() => import('./pages/Categories'));
const Settings = lazy(() => import('./pages/Settings'));

const FullPageSpinner = () => (
  <div className="center-screen">
    <Spin size="large" />
  </div>
);

function RequireAuth({ children }) {
  const { status } = useAuth();
  if (status === 'checking') return <FullPageSpinner />;
  return status === 'signedIn' ? children : <Navigate to="/login" replace />;
}

function GuestOnly({ children }) {
  const { status } = useAuth();
  if (status === 'checking') return <FullPageSpinner />;
  return status === 'signedIn' ? <Navigate to="/dashboard" replace /> : children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<GuestOnly><Landing /></GuestOnly>} />
      <Route path="/login" element={<GuestOnly><LoginPage /></GuestOnly>} />
      <Route path="/register" element={<GuestOnly><RegisterPage /></GuestOnly>} />
      <Route path="/forgot-password" element={<GuestOnly><ForgotPasswordPage /></GuestOnly>} />
      <Route
        element={
          <RequireAuth>
            <AppLayout />
          </RequireAuth>
        }
      >
        {[
          ['/dashboard', <Dashboard key="d" />],
          ['/transactions', <Transactions key="t" />],
          ['/budgets', <Budgets key="b" />],
          ['/recurring', <Recurring key="r" />],
          ['/categories', <Categories key="c" />],
          ['/settings', <Settings key="s" />],
        ].map(([path, el]) => (
          <Route key={path} path={path} element={<Suspense fallback={<Spin style={{ display: 'block', margin: 48 }} />}>{el}</Suspense>} />
        ))}
      </Route>
      <Route
        path="*"
        element={
          <Result
            status="404"
            title="Page not found"
            subTitle="That page doesn’t exist."
            extra={<Link to="/"><Button type="primary">Go home</Button></Link>}
          />
        }
      />
    </Routes>
  );
}
