import { useEffect } from 'react';
import { Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { TransactionModalProvider, useOpenTransaction } from './TransactionModal';
import { delay, fail } from '../../.storybook/mockApi';

/** Opens the form when the story loads, plus a button to open it again. */
function Opener({ tx }) {
  const open = useOpenTransaction();
  useEffect(() => open(tx), [open, tx]);
  return (
    <Button type="primary" icon={<PlusOutlined />} onClick={() => open(tx)}>
      {tx ? 'Edit transaction' : 'Add transaction'}
    </Button>
  );
}

export default {
  title: 'Forms/TransactionModal',
  component: TransactionModalProvider,
  parameters: {
    layout: 'fullscreen',
    docs: { story: { inline: false, height: '560px' } },
    api: {
      'POST /transactions': (config) => delay(600, { _id: 't-new', ...JSON.parse(config.data) }),
      'PUT /transactions/t1': (config) => delay(600, JSON.parse(config.data)),
    },
  },
  render: (args) => (
    <div style={{ padding: 24 }}>
      <TransactionModalProvider>
        <Opener tx={args.tx} />
      </TransactionModalProvider>
    </div>
  ),
};

/** Empty form. Try saving without an amount to see validation. */
export const AddTransaction = {};

/** Filled with an existing transaction. */
export const EditTransaction = {
  args: {
    tx: { _id: 't1', type: 'expense', amount: 86.4, category: 'Groceries', date: '2026-11-08T00:00:00.000Z', description: 'Costco', business: false },
  },
};

/** The server rejects the save, so the user sees its message. */
export const SaveFails = {
  parameters: { api: { 'POST /transactions': () => delay(500, fail(500, 'Could not save. Please try again.')) } },
};
