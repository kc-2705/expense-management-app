import { ArrowDownOutlined, ArrowUpOutlined, PercentageOutlined, WalletOutlined } from '@ant-design/icons';
import { StatCard } from './common';

export default {
  title: 'Data display/StatCard',
  component: StatCard,
  argTypes: {
    tone: { control: 'select', options: ['neutral', 'income', 'expense', 'primary'] },
    goodWhen: { control: 'inline-radio', options: ['up', 'down'] },
    icon: { control: false },
  },
  decorators: [(Story, { parameters }) => <div style={{ maxWidth: parameters.wide ? 'none' : 280 }}><Story /></div>],
};

/** Income went up, which is good, so the change is green. */
export const IncomeUp = {
  args: { label: 'Income', value: 5200, previous: 4800, tone: 'income', icon: <ArrowDownOutlined /> },
};

/** Expenses went up, which is bad, so the change is red. */
export const ExpensesUp = {
  args: { label: 'Expenses', value: 3100, previous: 2600, tone: 'expense', goodWhen: 'down', icon: <ArrowUpOutlined /> },
};

/** Expenses went down, which is good. */
export const ExpensesDown = {
  args: { label: 'Expenses', value: 2300, previous: 2600, tone: 'expense', goodWhen: 'down', icon: <ArrowUpOutlined /> },
};

/** A new user has nothing to compare against yet. */
export const NoLastMonth = {
  args: { label: 'Balance', value: 2100, tone: 'primary', icon: <WalletOutlined /> },
};

/** Percentages use a suffix instead of currency formatting. */
export const Percentage = {
  args: { label: 'Savings rate', value: 40, previous: 32, suffix: '%', icon: <PercentageOutlined /> },
};

/** The four cards as they sit on the dashboard. */
export const DashboardRow = {
  parameters: { wide: true, controls: { disable: true } },
  render: () => (
    <div className="stat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
      <StatCard {...IncomeUp.args} />
      <StatCard {...ExpensesUp.args} />
      <StatCard {...NoLastMonth.args} previous={2000} />
      <StatCard {...Percentage.args} />
    </div>
  ),
};
