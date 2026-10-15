import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Alert, Button, Form, Input, Steps, Typography } from 'antd';
import { LockOutlined, MailOutlined, UserOutlined } from '@ant-design/icons';
import { api, errorMessage } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Logo } from '../components/AppLayout';

function AuthShell({ title, subtitle, children, footer }) {
  return (
    <div className="auth-page">
      <aside className="auth-aside" aria-hidden="true">
        <Logo />
        <div className="auth-quote">
          <p>“I finally know where my money goes every month.”</p>
          <div className="auth-preview">
            <div><span>Groceries</span><b style={{ width: '72%', background: '#22c55e' }} /></div>
            <div><span>Dining</span><b style={{ width: '94%', background: '#f97316' }} /></div>
            <div><span>Transport</span><b style={{ width: '38%', background: '#0ea5e9' }} /></div>
          </div>
        </div>
      </aside>
      <main className="auth-main">
        <div className="auth-card">
          <div className="auth-mobile-logo"><Logo /></div>
          <Typography.Title level={2} style={{ marginBottom: 4 }}>{title}</Typography.Title>
          <Typography.Paragraph type="secondary">{subtitle}</Typography.Paragraph>
          {children}
          <div className="auth-footer">{footer}</div>
        </div>
      </main>
    </div>
  );
}

const emailRules = [
  { required: true, message: 'Enter your email.' },
  { type: 'email', message: 'Enter a valid email address.' },
];
const newPasswordRules = [
  { required: true, message: 'Choose a password.' },
  { min: 8, message: 'Use at least 8 characters.' },
];

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function onFinish(values) {
    setLoading(true);
    setError(null);
    try {
      await login(values);
      navigate('/dashboard');
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Log in to see your spending and budgets."
      footer={<>New to Expenso? <Link to="/register">Create an account</Link></>}
    >
      {error && <Alert type="error" title={error} showIcon style={{ marginBottom: 16 }} />}
      <Form layout="vertical" requiredMark={false} onFinish={onFinish} size="large">
        <Form.Item name="email" label="Email" rules={emailRules}>
          <Input prefix={<MailOutlined />} autoComplete="email" placeholder="you@example.com" />
        </Form.Item>
        <Form.Item name="password" label="Password" rules={[{ required: true, message: 'Enter your password.' }]} style={{ marginBottom: 8 }}>
          <Input.Password prefix={<LockOutlined />} autoComplete="current-password" />
        </Form.Item>
        <div style={{ textAlign: 'right', marginBottom: 16 }}>
          <Link to="/forgot-password">Forgot password?</Link>
        </div>
        <Button type="primary" htmlType="submit" block loading={loading}>Log in</Button>
      </Form>
    </AuthShell>
  );
}

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function onFinish({ confirm: _confirm, ...values }) {
    setLoading(true);
    setError(null);
    try {
      await register(values);
      navigate('/dashboard');
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Create your account"
      subtitle="Free, and ready in under a minute. We set up common categories for you."
      footer={<>Already have an account? <Link to="/login">Log in</Link></>}
    >
      {error && <Alert type="error" title={error} showIcon style={{ marginBottom: 16 }} />}
      <Form layout="vertical" requiredMark={false} onFinish={onFinish} size="large">
        <Form.Item name="name" label="Name" rules={[{ required: true, message: 'Enter your name.' }]}>
          <Input prefix={<UserOutlined />} autoComplete="name" />
        </Form.Item>
        <Form.Item name="email" label="Email" rules={emailRules}>
          <Input prefix={<MailOutlined />} autoComplete="email" placeholder="you@example.com" />
        </Form.Item>
        <Form.Item name="password" label="Password" rules={newPasswordRules} extra="At least 8 characters.">
          <Input.Password prefix={<LockOutlined />} autoComplete="new-password" />
        </Form.Item>
        <Form.Item
          name="confirm"
          label="Confirm password"
          dependencies={['password']}
          rules={[
            { required: true, message: 'Type the password again.' },
            ({ getFieldValue }) => ({
              validator: (_, v) => (!v || v === getFieldValue('password') ? Promise.resolve() : Promise.reject(new Error('The passwords don’t match.'))),
            }),
          ]}
        >
          <Input.Password prefix={<LockOutlined />} autoComplete="new-password" />
        </Form.Item>
        <Button type="primary" htmlType="submit" block loading={loading}>Create account</Button>
      </Form>
    </AuthShell>
  );
}

export function ForgotPasswordPage() {
  const { resetPassword } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [email, setEmail] = useState('');
  const [notice, setNotice] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function sendCode(values) {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.post('/auth/forgot-password', values);
      setEmail(values.email);
      setNotice(data.devCode ? `${data.message} Local demo: your code is ${data.devCode}.` : data.message);
      setStep(1);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setLoading(false);
    }
  }

  async function reset({ confirm: _confirm, ...values }) {
    setLoading(true);
    setError(null);
    try {
      await resetPassword({ email, ...values });
      navigate('/dashboard');
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Reset your password"
      subtitle="We’ll email you a 6-digit code. It works once and expires in 15 minutes."
      footer={<Link to="/login">Back to log in</Link>}
    >
      <Steps size="small" current={step} items={[{ title: 'Email' }, { title: 'New password' }]} style={{ marginBottom: 24 }} />
      {error && <Alert type="error" title={error} showIcon style={{ marginBottom: 16 }} />}
      {step === 0 ? (
        <Form layout="vertical" requiredMark={false} onFinish={sendCode} size="large">
          <Form.Item name="email" label="Email" rules={emailRules}>
            <Input prefix={<MailOutlined />} autoComplete="email" />
          </Form.Item>
          <Button type="primary" htmlType="submit" block loading={loading}>Send code</Button>
        </Form>
      ) : (
        <Form layout="vertical" requiredMark={false} onFinish={reset} size="large">
          {notice && <Alert type="info" title={notice} showIcon style={{ marginBottom: 16 }} />}
          <Form.Item name="code" label="6-digit code" rules={[{ required: true, pattern: /^\d{6}$/, message: 'Enter the 6-digit code.' }]}>
            <Input.OTP length={6} />
          </Form.Item>
          <Form.Item name="newPassword" label="New password" rules={newPasswordRules}>
            <Input.Password prefix={<LockOutlined />} autoComplete="new-password" />
          </Form.Item>
          <Form.Item
            name="confirm"
            label="Confirm new password"
            dependencies={['newPassword']}
            rules={[
              { required: true, message: 'Type the password again.' },
              ({ getFieldValue }) => ({
                validator: (_, v) => (!v || v === getFieldValue('newPassword') ? Promise.resolve() : Promise.reject(new Error('The passwords don’t match.'))),
              }),
            ]}
          >
            <Input.Password prefix={<LockOutlined />} autoComplete="new-password" />
          </Form.Item>
          <Button type="primary" htmlType="submit" block loading={loading}>Reset password and log in</Button>
          <Button type="link" block onClick={() => setStep(0)} style={{ marginTop: 8 }}>Use a different email</Button>
        </Form>
      )}
    </AuthShell>
  );
}
