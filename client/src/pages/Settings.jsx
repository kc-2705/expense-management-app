import { useState } from 'react';
import { Alert, App, Button, Card, Col, Form, Input, Modal, Row, Select, Switch, Typography } from 'antd';
import { api, errorMessage } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useThemeMode } from '../context/ThemeContext';
import { PageHeader } from '../components/common';
import { CURRENCIES } from '../utils/format';

export default function Settings() {
  const { message } = App.useApp();
  const { user, updateUser, signOut } = useAuth();
  const { mode, toggle } = useThemeMode();
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [pwForm] = Form.useForm();

  async function saveProfile(values) {
    setSavingProfile(true);
    try {
      const { data } = await api.put('/auth/me', values);
      updateUser(data.user);
      message.success('Profile saved');
    } catch (e) {
      message.error(errorMessage(e));
    } finally {
      setSavingProfile(false);
    }
  }

  async function changePassword({ currentPassword, newPassword }) {
    setSavingPassword(true);
    try {
      await api.put('/auth/password', { currentPassword, newPassword });
      pwForm.resetFields();
      message.success('Password changed');
    } catch (e) {
      message.error(errorMessage(e));
    } finally {
      setSavingPassword(false);
    }
  }

  async function deleteAccount() {
    try {
      await api.delete('/auth/me');
      signOut();
    } catch (e) {
      message.error(errorMessage(e));
    }
  }

  return (
    <>
      <PageHeader title="Settings" subtitle="Your profile, currency, look and security." />
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="Profile">
            <Form layout="vertical" requiredMark={false} initialValues={{ name: user?.name, currency: user?.currency }} onFinish={saveProfile}>
              <Form.Item label="Email">
                <Input value={user?.email} disabled />
              </Form.Item>
              <Form.Item name="name" label="Name" rules={[{ required: true, whitespace: true, message: 'Enter your name.' }]}>
                <Input maxLength={60} />
              </Form.Item>
              <Form.Item name="currency" label="Currency" extra="Changes how amounts are shown. It doesn’t convert existing amounts.">
                <Select options={CURRENCIES.map((c) => ({ value: c, label: c }))} />
              </Form.Item>
              <Button type="primary" htmlType="submit" loading={savingProfile}>Save profile</Button>
            </Form>
          </Card>
          <Card title="Appearance" style={{ marginTop: 16 }}>
            <div className="setting-row">
              <div>
                <Typography.Text strong>Dark mode</Typography.Text>
                <div className="muted">Easier on the eyes at night.</div>
              </div>
              <Switch checked={mode === 'dark'} onChange={toggle} aria-label="Dark mode" />
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Change password">
            <Form form={pwForm} layout="vertical" requiredMark={false} onFinish={changePassword}>
              <Form.Item name="currentPassword" label="Current password" rules={[{ required: true, message: 'Enter your current password.' }]}>
                <Input.Password autoComplete="current-password" />
              </Form.Item>
              <Form.Item name="newPassword" label="New password" rules={[{ required: true, min: 8, message: 'Use at least 8 characters.' }]}>
                <Input.Password autoComplete="new-password" />
              </Form.Item>
              <Button htmlType="submit" loading={savingPassword}>Change password</Button>
            </Form>
          </Card>
          <Card title="Delete account" style={{ marginTop: 16 }} className="danger-card">
            <Typography.Paragraph type="secondary">
              Permanently deletes your account and all your transactions, budgets, categories and recurring payments.
            </Typography.Paragraph>
            <Button danger onClick={() => setDeleteOpen(true)}>Delete my account</Button>
          </Card>
        </Col>
      </Row>

      <Modal
        title="Delete your account?"
        open={deleteOpen}
        onCancel={() => {
          setDeleteOpen(false);
          setConfirmText('');
        }}
        onOk={deleteAccount}
        okText="Delete everything"
        okButtonProps={{ danger: true, disabled: confirmText !== 'DELETE' }}
      >
        <Alert type="error" showIcon title="This can’t be undone. Export your transactions first if you want a copy." style={{ marginBottom: 16 }} />
        <Typography.Paragraph>Type <b>DELETE</b> to confirm.</Typography.Paragraph>
        <Input value={confirmText} onChange={(e) => setConfirmText(e.target.value)} placeholder="DELETE" aria-label="Type DELETE to confirm" />
      </Modal>
    </>
  );
}
