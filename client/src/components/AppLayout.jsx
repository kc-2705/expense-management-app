import { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Avatar, Button, Drawer, Dropdown, Grid, Layout, Menu, Tooltip } from 'antd';
import {
  AppstoreOutlined,
  DashboardOutlined,
  FundOutlined,
  LogoutOutlined,
  MenuOutlined,
  MoonOutlined,
  PlusOutlined,
  RetweetOutlined,
  SettingOutlined,
  SunOutlined,
  UnorderedListOutlined,
} from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';
import { useThemeMode } from '../context/ThemeContext';
import { TransactionModalProvider, useOpenTransaction } from './TransactionModal';

const NAV = [
  { key: '/dashboard', icon: <DashboardOutlined />, label: 'Dashboard' },
  { key: '/transactions', icon: <UnorderedListOutlined />, label: 'Transactions' },
  { key: '/budgets', icon: <FundOutlined />, label: 'Budgets' },
  { key: '/recurring', icon: <RetweetOutlined />, label: 'Recurring' },
  { key: '/categories', icon: <AppstoreOutlined />, label: 'Categories' },
  { key: '/settings', icon: <SettingOutlined />, label: 'Settings' },
];

export function Logo({ compact = false }) {
  return (
    <Link to="/" className="logo" aria-label="Expenso home">
      <img src="/favicon.svg" alt="" width={30} height={30} />
      {!compact && <span>Expenso</span>}
    </Link>
  );
}

function SideMenu({ onNavigate }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const selected = NAV.find((n) => pathname.startsWith(n.key))?.key;
  return (
    <Menu
      mode="inline"
      selectedKeys={selected ? [selected] : []}
      items={NAV}
      onClick={({ key }) => {
        navigate(key);
        onNavigate?.();
      }}
      style={{ borderInlineEnd: 'none' }}
    />
  );
}

function TopBar({ onMenu, isMobile }) {
  const { user, signOut } = useAuth();
  const { mode, toggle } = useThemeMode();
  const navigate = useNavigate();
  const openTransaction = useOpenTransaction();
  const initials = (user?.name || '?').split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className="topbar">
      {isMobile ? (
        <div className="topbar-left">
          <Button type="text" icon={<MenuOutlined />} onClick={onMenu} aria-label="Open menu" />
          <Logo />
        </div>
      ) : (
        <span />
      )}
      <div className="topbar-right">
        <Button type="primary" icon={<PlusOutlined />} onClick={() => openTransaction()}>
          {isMobile ? null : 'Add transaction'}
        </Button>
        <Tooltip title={mode === 'dark' ? 'Light mode' : 'Dark mode'}>
          <Button type="text" icon={mode === 'dark' ? <SunOutlined /> : <MoonOutlined />} onClick={toggle} aria-label="Switch theme" />
        </Tooltip>
        <Dropdown
          trigger={['click']}
          menu={{
            items: [
              { key: 'who', label: <div className="menu-user"><strong>{user?.name}</strong><span>{user?.email}</span></div>, disabled: true },
              { type: 'divider' },
              { key: 'settings', icon: <SettingOutlined />, label: 'Settings', onClick: () => navigate('/settings') },
              { key: 'out', icon: <LogoutOutlined />, label: 'Sign out', danger: true, onClick: signOut },
            ],
          }}
        >
          <Button type="text" className="avatar-btn" aria-label="Account menu">
            <Avatar style={{ background: '#0f766e' }}>{initials}</Avatar>
          </Button>
        </Dropdown>
      </div>
    </div>
  );
}

export default function AppLayout() {
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.lg;
  const [drawer, setDrawer] = useState(false);

  return (
    <TransactionModalProvider>
      <Layout className="app-shell">
        {!isMobile && (
          <Layout.Sider width={232} theme="light" className="app-sider">
            <div className="sider-logo"><Logo /></div>
            <SideMenu />
          </Layout.Sider>
        )}
        <Drawer open={isMobile && drawer} onClose={() => setDrawer(false)} placement="left" size={260} title={<Logo />} styles={{ body: { padding: 8 } }}>
          <SideMenu onNavigate={() => setDrawer(false)} />
        </Drawer>
        <Layout>
          <TopBar isMobile={isMobile} onMenu={() => setDrawer(true)} />
          <Layout.Content className="app-content">
            <Outlet />
          </Layout.Content>
        </Layout>
      </Layout>
    </TransactionModalProvider>
  );
}
