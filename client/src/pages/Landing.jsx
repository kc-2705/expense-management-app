import { Link } from 'react-router-dom';
import { Button } from 'antd';
import {
  BellOutlined,
  CloudUploadOutlined,
  FilePdfOutlined,
  FundOutlined,
  LockOutlined,
  PieChartOutlined,
  RetweetOutlined,
} from '@ant-design/icons';
import { Logo } from '../components/AppLayout';

const FEATURES = [
  { icon: <PieChartOutlined />, title: 'See where it goes', body: 'A monthly dashboard with spending by category, a 6-month trend and your biggest expenses.' },
  { icon: <FundOutlined />, title: 'Budgets that warn you', body: 'Set a monthly limit per category. Bars turn amber at 80% and red when you go over.' },
  { icon: <RetweetOutlined />, title: 'Recurring payments', body: 'Rent, salary and subscriptions add themselves on schedule, so nothing is missed.' },
  { icon: <CloudUploadOutlined />, title: 'Import your bank CSV', body: 'Upload a statement and Expenso reads the dates and amounts for you.' },
  { icon: <FilePdfOutlined />, title: 'Export anytime', body: 'Download any filtered list as a CSV for Excel or a clean PDF report.' },
  { icon: <LockOutlined />, title: 'Private by design', body: 'Hashed passwords, signed sessions, and every request checked against your account.' },
];

export default function Landing() {
  return (
    <div className="landing">
      <header className="landing-nav">
        <Logo />
        <nav>
          <Link to="/login">Log in</Link>
          <Link to="/register"><Button type="primary">Get started</Button></Link>
        </nav>
      </header>

      <section className="hero">
        <div className="hero-copy">
          <span className="eyebrow">Personal finance, made calm</span>
          <h1>Know where every dollar goes.</h1>
          <p>Expenso tracks your income and spending, keeps you inside your budgets, and shows the trends that matter, in one tidy place.</p>
          <div className="hero-actions">
            <Link to="/register"><Button type="primary" size="large">Create a free account</Button></Link>
            <Link to="/login"><Button size="large">I have an account</Button></Link>
          </div>
        </div>
        <div className="hero-card" aria-hidden="true">
          <div className="hero-card-row">
            <div><span>Income</span><strong className="pos">$5,200</strong></div>
            <div><span>Spent</span><strong className="neg">$3,184</strong></div>
            <div><span>Saved</span><strong>39%</strong></div>
          </div>
          <div className="hero-bars">
            {[52, 64, 47, 71, 58, 66].map((h, i) => (
              <div key={i} className="hero-bar">
                <i style={{ height: `${h + 20}%` }} className="in" />
                <i style={{ height: `${h}%` }} className="out" />
              </div>
            ))}
          </div>
          <div className="hero-budget">
            <span><BellOutlined /> Dining is at 94% of budget</span>
            <b><i style={{ width: '94%' }} /></b>
          </div>
        </div>
      </section>

      <section className="feature-grid">
        {FEATURES.map((f) => (
          <article key={f.title} className="feature">
            <span className="feature-icon">{f.icon}</span>
            <h3>{f.title}</h3>
            <p>{f.body}</p>
          </article>
        ))}
      </section>

      <footer className="landing-footer">Built by Kavya Immanni · React, Node.js, Express, MongoDB</footer>
    </div>
  );
}
