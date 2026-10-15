import { useMemo, useState } from 'react';
import { App, Button, Card, DatePicker, Empty, Form, Input, InputNumber, Modal, Popconfirm, Segmented, Select, Space, Switch, Table, Tag } from 'antd';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { useCategories, useDeleteRecurring, useRecurring, useSaveRecurring } from '../api/hooks';
import { errorMessage } from '../api/client';
import { Amount, PageHeader, useCategoryLookup, useCurrency } from '../components/common';
import CategoryIcon from '../components/CategoryIcon';
import { dayjs, money, showDate, toDayParam, toPickerDay } from '../utils/format';

const FREQ = { weekly: 'Every week', monthly: 'Every month', yearly: 'Every year' };
const PER_MONTH = { weekly: 52 / 12, monthly: 1, yearly: 1 / 12 };

export default function Recurring() {
  const { message } = App.useApp();
  const currency = useCurrency();
  const lookup = useCategoryLookup();
  const { data = [], isLoading } = useRecurring();
  const save = useSaveRecurring();
  const remove = useDeleteRecurring();
  const [editing, setEditing] = useState(null);

  // What active rules add up to in an average month.
  const monthly = useMemo(() => {
    const sum = (type) => data.filter((r) => r.active && r.type === type).reduce((s, r) => s + r.amount * PER_MONTH[r.frequency], 0);
    return { income: sum('income'), expense: sum('expense') };
  }, [data]);

  async function toggle(rule, active) {
    try {
      const { _id, ...rest } = rule;
      await save.mutateAsync({ id: _id, ...pick(rest), active, nextDate: toDayParam(toPickerDay(rule.nextDate)) });
      message.success(active ? 'Resumed' : 'Paused');
    } catch (e) {
      message.error(errorMessage(e));
    }
  }

  const columns = [
    {
      title: 'Payment',
      key: 'what',
      render: (_, r) => {
        const cat = lookup(r.type, r.category);
        return (
          <Space size={12}>
            <CategoryIcon icon={cat.icon} color={cat.color} />
            <span className="tx-text">
              <strong>{r.description || r.category}</strong>
              <span>{r.category}</span>
            </span>
          </Space>
        );
      },
    },
    { title: 'How often', dataIndex: 'frequency', render: (f) => FREQ[f], responsive: ['sm'] },
    {
      title: 'Next',
      dataIndex: 'nextDate',
      render: (d, r) => (r.active ? showDate(d) : <Tag>Paused</Tag>),
    },
    { title: 'Amount', dataIndex: 'amount', align: 'right', render: (v, r) => <Amount value={v} type={r.type} /> },
    {
      title: 'Active',
      key: 'active',
      align: 'center',
      render: (_, r) => <Switch size="small" checked={r.active} onChange={(v) => toggle(r, v)} aria-label="Active" />,
    },
    {
      title: '',
      key: 'actions',
      align: 'right',
      render: (_, r) => (
        <Space size={0}>
          <Button type="text" icon={<EditOutlined />} onClick={() => setEditing(r)} aria-label="Edit" />
          <Popconfirm
            title="Delete this recurring payment?"
            description="Transactions it already added stay."
            okText="Delete"
            okButtonProps={{ danger: true }}
            onConfirm={() => remove.mutateAsync(r._id).then(() => message.success('Deleted'))}
          >
            <Button type="text" danger icon={<DeleteOutlined />} aria-label="Delete" />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Recurring payments"
        subtitle="Rent, salary and subscriptions add themselves on their date."
        extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => setEditing({})}>Add recurring</Button>}
      />
      {data.length > 0 && (
        <div className="mini-stats">
          <div><span>Fixed income / month</span><b className="amount income">{money(monthly.income, currency)}</b></div>
          <div><span>Fixed costs / month</span><b className="amount expense">{money(monthly.expense, currency)}</b></div>
          <div><span>Left after fixed costs</span><b>{money(monthly.income - monthly.expense, currency)}</b></div>
        </div>
      )}
      <Card styles={{ body: { padding: 0 } }}>
        <Table
          rowKey="_id"
          loading={isLoading}
          columns={columns}
          dataSource={data}
          pagination={false}
          scroll={{ x: 560 }}
          locale={{
            emptyText: (
              <Empty description="No recurring payments yet. Add rent, salary or a subscription.">
                <Button type="primary" icon={<PlusOutlined />} onClick={() => setEditing({})}>Add recurring</Button>
              </Empty>
            ),
          }}
        />
      </Card>
      <RecurringModal open={editing !== null} rule={editing} onClose={() => setEditing(null)} />
    </>
  );
}

const pick = (r) => ({ type: r.type, amount: r.amount, category: r.category, description: r.description, frequency: r.frequency });

function RecurringModal({ open, rule, onClose }) {
  const { message } = App.useApp();
  const currency = useCurrency();
  const { data: categories = [] } = useCategories();
  const save = useSaveRecurring();
  const [form] = Form.useForm();
  const type = Form.useWatch('type', form) ?? 'expense';
  const isEdit = Boolean(rule?._id);

  async function submit() {
    const values = await form.validateFields();
    try {
      await save.mutateAsync({ id: rule?._id, ...values, nextDate: toDayParam(values.nextDate), active: rule?.active ?? true });
      message.success(isEdit ? 'Recurring payment updated' : 'Recurring payment added');
      onClose();
    } catch (e) {
      message.error(errorMessage(e));
    }
  }

  return (
    <Modal
      title={isEdit ? 'Edit recurring payment' : 'Add recurring payment'}
      open={open}
      onCancel={onClose}
      onOk={submit}
      okText="Save"
      confirmLoading={save.isPending}
      destroyOnHidden
      afterOpenChange={(o) =>
        o &&
        form.setFieldsValue(
          isEdit
            ? { ...pick(rule), nextDate: toPickerDay(rule.nextDate) }
            : { type: 'expense', frequency: 'monthly', nextDate: dayjs().add(1, 'month').startOf('month') },
        )
      }
    >
      <Form form={form} layout="vertical" requiredMark={false}>
        <Form.Item name="type">
          <Segmented block options={[{ label: 'Expense', value: 'expense' }, { label: 'Income', value: 'income' }]} onChange={() => form.setFieldValue('category', undefined)} />
        </Form.Item>
        <Form.Item name="description" label="Name" rules={[{ required: true, message: 'Give it a name, like Rent or Netflix.' }]}>
          <Input placeholder="e.g. Rent, Salary, Netflix" maxLength={200} />
        </Form.Item>
        <Space.Compact block>
          <Form.Item name="amount" label="Amount" style={{ flex: 1 }} rules={[{ required: true, message: 'Enter an amount.' }]}>
            <InputNumber min={0.01} precision={2} prefix={currency} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="frequency" label="How often" style={{ flex: 1 }}>
            <Select options={Object.entries(FREQ).map(([value, label]) => ({ value, label }))} />
          </Form.Item>
        </Space.Compact>
        <Form.Item name="category" label="Category" rules={[{ required: true, message: 'Choose a category.' }]}>
          <Select showSearch options={categories.filter((c) => c.type === type).map((c) => ({ value: c.name, label: c.name }))} />
        </Form.Item>
        <Form.Item
          name="nextDate"
          label={isEdit ? 'Next date' : 'First date'}
          extra="If this date is today or earlier, the payments up to today are added right away."
          rules={[{ required: true, message: 'Pick a date.' }]}
        >
          <DatePicker style={{ width: '100%' }} format="MMM D, YYYY" />
        </Form.Item>
      </Form>
    </Modal>
  );
}
