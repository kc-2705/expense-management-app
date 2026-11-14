import { Amount } from './common';

export default {
  title: 'Data display/Amount',
  component: Amount,
  argTypes: { type: { control: 'inline-radio', options: ['income', 'expense'] } },
  args: { value: 1250, type: 'income', strong: true },
};

export const Income = {};

export const Expense = { args: { value: 84.5, type: 'expense' } };

export const Regular = { args: { value: 19.99, type: 'expense', strong: false } };
