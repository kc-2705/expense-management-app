import { Progress, Typography } from 'antd';
import CategoryIcon from './CategoryIcon';
import { useCategoryLookup, useCurrency } from './common';
import { money } from '../utils/format';
import { BRAND } from '../context/ThemeContext';

const STATUS_COLOR = { ok: BRAND.primary, warning: BRAND.warning, over: BRAND.expense };

export function statusText(b, currency) {
  if (b.status === 'over') return `${money(Math.abs(b.remaining), currency)} over budget`;
  if (b.status === 'warning') return `${money(b.remaining, currency)} left · almost there`;
  return `${money(b.remaining, currency)} left`;
}

/** One budget: icon, name, spent of limit, and a colored progress bar. */
export default function BudgetBar({ budget }) {
  const currency = useCurrency();
  const lookup = useCategoryLookup();
  const cat = lookup('expense', budget.category);
  return (
    <div className="budget-bar">
      <CategoryIcon icon={cat.icon} color={cat.color} size={30} />
      <div className="budget-body">
        <Typography.Text strong className="budget-name">{budget.category}</Typography.Text>
        <Progress
          percent={Math.min(budget.percent, 100)}
          showInfo={false}
          strokeColor={STATUS_COLOR[budget.status]}
          size="small"
          aria-label={`${budget.category}: ${budget.percent}% of budget used`}
        />
        <div className="budget-line">
          <Typography.Text className={`budget-status ${budget.status}`}>{statusText(budget, currency)}</Typography.Text>
          <Typography.Text type="secondary" className="nowrap budget-amounts">
            {money(budget.spent, currency)} / {money(budget.limit, currency)}
          </Typography.Text>
        </div>
      </div>
    </div>
  );
}
