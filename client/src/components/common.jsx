import { useMemo } from 'react';
import { Button, DatePicker, Space, Typography } from 'antd';
import { ArrowDownOutlined, ArrowUpOutlined, LeftOutlined, RightOutlined } from '@ant-design/icons';
import { useCategories } from '../api/hooks';
import { useAuth } from '../context/AuthContext';
import { change, dayjs, money } from '../utils/format';

/** Page title row with optional subtitle and actions on the right. */
export function PageHeader({ title, subtitle, extra }) {
  return (
    <div className="page-header">
      <div style={{ minWidth: 0 }}>
        <Typography.Title level={2} className="page-title">{title}</Typography.Title>
        {subtitle ? <Typography.Text type="secondary">{subtitle}</Typography.Text> : null}
      </div>
      {extra ? <Space wrap>{extra}</Space> : null}
    </div>
  );
}

/** The signed-in user's currency, for formatting money. */
export function useCurrency() {
  return useAuth().user?.currency ?? 'USD';
}

/** Look up a category's color and icon by type and name. */
export function useCategoryLookup() {
  const { data = [] } = useCategories();
  return useMemo(() => {
    const map = new Map(data.map((c) => [`${c.type}:${c.name}`, c]));
    return (type, name) => map.get(`${type}:${name}`) ?? { name, color: '#64748b', icon: 'tag' };
  }, [data]);
}

/** +$12.00 in green for income, −$12.00 in red for an expense. */
export function Amount({ value, type, strong = true }) {
  const currency = useCurrency();
  const sign = type === 'income' ? '+' : '−';
  return (
    <span className={`amount ${type}`} style={{ fontWeight: strong ? 600 : 400 }}>
      {sign}
      {money(value, currency)}
    </span>
  );
}

/** A big number with its change from last month. `goodWhen` says whether up is good. */
export function StatCard({ label, value, previous, icon, tone = 'neutral', goodWhen = 'up', suffix }) {
  const currency = useCurrency();
  const pct = previous === undefined ? null : change(value, previous);
  const up = pct > 0;
  const good = pct === 0 || (goodWhen === 'up' ? up : !up);
  return (
    <div className={`stat-card tone-${tone}`}>
      <div className="stat-top">
        <span className="stat-label">{label}</span>
        <span className="stat-icon" aria-hidden="true">{icon}</span>
      </div>
      <div className="stat-value">{suffix ? `${value ?? '–'}${value == null ? '' : suffix}` : money(value, currency)}</div>
      {pct === null ? (
        <span className="stat-change muted">No data for last month</span>
      ) : (
        <span className={`stat-change ${good ? 'good' : 'bad'}`}>
          {up ? <ArrowUpOutlined /> : pct < 0 ? <ArrowDownOutlined /> : null} {Math.abs(pct)}% vs last month
        </span>
      )}
    </div>
  );
}

/** Month switcher: ‹ October 2026 ›, not past the current month. */
export function MonthSwitcher({ value, onChange }) {
  const current = dayjs().format('YYYY-MM');
  const shift = (n) => onChange(dayjs(`${value}-01`).add(n, 'month').format('YYYY-MM'));
  return (
    <Space.Compact>
      <Button icon={<LeftOutlined />} onClick={() => shift(-1)} aria-label="Previous month" />
      <DatePicker
        picker="month"
        allowClear={false}
        value={dayjs(`${value}-01`)}
        format="MMMM YYYY"
        disabledDate={(d) => d.format('YYYY-MM') > current}
        onChange={(d) => d && onChange(d.format('YYYY-MM'))}
        style={{ width: 150 }}
      />
      <Button icon={<RightOutlined />} onClick={() => shift(1)} disabled={value >= current} aria-label="Next month" />
    </Space.Compact>
  );
}
