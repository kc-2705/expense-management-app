import { useState } from 'react';
import { App, Button, Card, Empty, Form, InputNumber, Modal, Popconfirm, Progress, Select, Skeleton, Space } from 'antd';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { useBudgets, useCategories, useDeleteBudget, useSaveBudget } from '../api/hooks';
import { errorMessage } from '../api/client';
import { MonthSwitcher, PageHeader, useCurrency } from '../components/common';
import BudgetBar from '../components/BudgetBar';
import { BRAND } from '../context/ThemeContext';
import { currentMonth, monthLabel, money } from '../utils/format';

export default function Budgets() {
  const { message } = App.useApp();
  const currency = useCurrency();
  const [month, setMonth] = useState(currentMonth());
  const { data, isLoading } = useBudgets(month);
  const { data: categories = [] } = useCategories();
  const remove = useDeleteBudget();
  const [editing, setEditing] = useState(null); // null = closed, {} = new, budget = edit

  const items = data?.items ?? [];
  const totalLimit = items.reduce((s, b) => s + b.limit, 0);
  const totalSpent = items.reduce((s, b) => s + b.spent, 0);
  const totalPct = totalLimit ? Math.round((totalSpent / totalLimit) * 100) : 0;

  async function onDelete(id) {
    try {
      await remove.mutateAsync(id);
      message.success('Budget removed');
    } catch (e) {
      message.error(errorMessage(e));
    }
  }

  return (
    <>
      <PageHeader
        title="Budgets"
        subtitle="A monthly limit per category. You’ll see a warning at 80% and when you go over."
        extra={
          <>
            <MonthSwitcher value={month} onChange={setMonth} />
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setEditing({})}>Set budget</Button>
          </>
        }
      />

      {isLoading ? (
        <Skeleton active />
      ) : items.length === 0 ? (
        <Card>
          <Empty description="No budgets yet. Pick a category and set a monthly limit.">
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setEditing({})}>Set your first budget</Button>
          </Empty>
        </Card>
      ) : (
        <>
          <Card className="budget-total">
            <div className="budget-total-row">
              <div>
                <span className="muted">Total budgeted for {monthLabel(month)}</span>
                <div className="big-number">
                  {money(totalSpent, currency)} <span className="muted">of {money(totalLimit, currency)}</span>
                </div>
              </div>
              <Progress
                type="circle"
                percent={Math.min(totalPct, 100)}
                format={() => `${totalPct}%`}
                size={84}
                strokeColor={totalPct >= 100 ? BRAND.expense : totalPct >= 80 ? BRAND.warning : BRAND.primary}
              />
            </div>
          </Card>
          <div className="budget-grid">
            {items.map((b) => (
              <Card key={b._id} className={`budget-card ${b.status}`}>
                <BudgetBar budget={b} />
                <Space className="budget-actions" size={0}>
                  <Button type="text" size="small" icon={<EditOutlined />} onClick={() => setEditing(b)} aria-label={`Edit ${b.category} budget`} />
                  <Popconfirm title={`Remove the ${b.category} budget?`} okText="Remove" okButtonProps={{ danger: true }} onConfirm={() => onDelete(b._id)}>
                    <Button type="text" size="small" danger icon={<DeleteOutlined />} aria-label={`Remove ${b.category} budget`} />
                  </Popconfirm>
                </Space>
              </Card>
            ))}
          </div>
        </>
      )}

      <BudgetModal
        open={editing !== null}
        budget={editing}
        onClose={() => setEditing(null)}
        options={categories
          .filter((c) => c.type === 'expense' && (editing?.category === c.name || !items.some((b) => b.category === c.name)))
          .map((c) => ({ value: c.name, label: c.name }))}
      />
    </>
  );
}

function BudgetModal({ open, budget, onClose, options }) {
  const { message } = App.useApp();
  const currency = useCurrency();
  const save = useSaveBudget();
  const [form] = Form.useForm();
  const isEdit = Boolean(budget?._id);

  async function submit() {
    const values = await form.validateFields();
    try {
      await save.mutateAsync(values);
      message.success('Budget saved');
      onClose();
    } catch (e) {
      message.error(errorMessage(e));
    }
  }

  return (
    <Modal
      title={isEdit ? `Edit ${budget.category} budget` : 'Set a budget'}
      open={open}
      onCancel={onClose}
      onOk={submit}
      okText="Save"
      confirmLoading={save.isPending}
      destroyOnHidden
      afterOpenChange={(o) => o && form.setFieldsValue({ category: budget?.category, limit: budget?.limit })}
    >
      <Form form={form} layout="vertical" requiredMark={false}>
        <Form.Item name="category" label="Category" rules={[{ required: true, message: 'Choose a category.' }]}>
          <Select options={options} disabled={isEdit} placeholder="Choose an expense category" showSearch />
        </Form.Item>
        <Form.Item name="limit" label="Monthly limit" rules={[{ required: true, message: 'Enter a limit.' }]}>
          <InputNumber min={1} precision={0} prefix={currency} style={{ width: '100%' }} placeholder="e.g. 400" />
        </Form.Item>
      </Form>
    </Modal>
  );
}
