import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { App, DatePicker, Form, Input, InputNumber, Modal, Segmented, Select, Space } from 'antd';
import { useCategories, useSaveTransaction } from '../api/hooks';
import { errorMessage } from '../api/client';
import { dayjs, toDayParam, toPickerDay } from '../utils/format';
import CategoryIcon from './CategoryIcon';
import { useCurrency } from './common';

const TxModalContext = createContext(() => {});

/** Lets any page open the add/edit transaction form: openTransaction() or openTransaction(tx). */
export const useOpenTransaction = () => useContext(TxModalContext);

export function TransactionModalProvider({ children }) {
  const [state, setState] = useState({ open: false, tx: null });
  const open = useCallback((tx = null) => setState({ open: true, tx }), []);
  return (
    <TxModalContext.Provider value={open}>
      {children}
      <TransactionModal open={state.open} tx={state.tx} onClose={() => setState({ open: false, tx: null })} />
    </TxModalContext.Provider>
  );
}

function TransactionModal({ open, tx, onClose }) {
  const [form] = Form.useForm();
  const { message } = App.useApp();
  const currency = useCurrency();
  const { data: categories = [] } = useCategories();
  const save = useSaveTransaction();
  const type = Form.useWatch('type', form) ?? 'expense';

  useEffect(() => {
    if (!open) return;
    form.setFieldsValue(
      tx
        ? { ...tx, date: toPickerDay(tx.date) }
        : { type: 'expense', amount: null, category: undefined, description: '', date: dayjs() },
    );
  }, [open, tx, form]);

  const options = useMemo(
    () =>
      categories
        .filter((c) => c.type === type)
        .map((c) => ({
          value: c.name,
          label: (
            <Space size={8}>
              <CategoryIcon icon={c.icon} color={c.color} size={22} />
              {c.name}
            </Space>
          ),
          search: c.name.toLowerCase(),
        })),
    [categories, type],
  );

  async function submit() {
    const values = await form.validateFields();
    try {
      await save.mutateAsync({ id: tx?._id, ...values, date: toDayParam(values.date) });
      message.success(tx ? 'Transaction updated' : 'Transaction added');
      onClose();
    } catch (e) {
      message.error(errorMessage(e));
    }
  }

  return (
    <Modal
      title={tx ? 'Edit transaction' : 'Add transaction'}
      open={open}
      onCancel={onClose}
      onOk={submit}
      okText={tx ? 'Save changes' : 'Add'}
      confirmLoading={save.isPending}
      destroyOnHidden
    >
      <Form form={form} layout="vertical" requiredMark={false} onFinish={submit}>
        <Form.Item name="type" style={{ marginBottom: 16 }}>
          <Segmented
            block
            options={[
              { label: 'Expense', value: 'expense' },
              { label: 'Income', value: 'income' },
            ]}
            onChange={() => form.setFieldValue('category', undefined)}
          />
        </Form.Item>
        <Form.Item name="amount" label="Amount" rules={[{ required: true, message: 'Enter an amount.' }]}>
          <InputNumber min={0.01} step={1} precision={2} prefix={currency} style={{ width: '100%' }} placeholder="0.00" autoFocus />
        </Form.Item>
        <Form.Item name="category" label="Category" rules={[{ required: true, message: 'Choose a category.' }]}>
          <Select
            showSearch
            options={options}
            placeholder="Choose a category"
            filterOption={(input, opt) => opt.search.includes(input.toLowerCase())}
          />
        </Form.Item>
        <Form.Item name="date" label="Date" rules={[{ required: true, message: 'Pick a date.' }]}>
          <DatePicker style={{ width: '100%' }} format="MMM D, YYYY" disabledDate={(d) => d.isAfter(dayjs().add(1, 'year'))} />
        </Form.Item>
        <Form.Item name="description" label="Description">
          <Input placeholder="e.g. Costco, Rent for October" maxLength={200} />
        </Form.Item>
        <button type="submit" hidden />
      </Form>
    </Modal>
  );
}
