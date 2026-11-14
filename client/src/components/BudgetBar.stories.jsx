import BudgetBar from './BudgetBar';

export default {
  title: 'Data display/BudgetBar',
  component: BudgetBar,
  decorators: [(Story) => <div style={{ maxWidth: 420 }}><Story /></div>],
};

const budget = (category, spent, limit) => {
  const percent = Math.round((spent / limit) * 100);
  return { category, spent, limit, remaining: limit - spent, percent, status: percent >= 100 ? 'over' : percent >= 80 ? 'warning' : 'ok' };
};

/** Under 80% of the budget: teal bar. */
export const OnTrack = { args: { budget: budget('Groceries', 240, 500) } };

/** 80% or more: amber bar and "almost there". */
export const AlmostThere = { args: { budget: budget('Dining out', 178, 200) } };

/** Over the limit: red bar, capped at 100%. */
export const OverBudget = { args: { budget: budget('Entertainment', 165, 120) } };

/** A few budgets together, as on the Budgets page. */
export const List = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{ display: 'grid', gap: 18 }}>
      <BudgetBar budget={budget('Rent', 1400, 1400)} />
      <BudgetBar budget={budget('Groceries', 240, 500)} />
      <BudgetBar budget={budget('Dining out', 178, 200)} />
      <BudgetBar budget={budget('Entertainment', 165, 120)} />
    </div>
  ),
};
