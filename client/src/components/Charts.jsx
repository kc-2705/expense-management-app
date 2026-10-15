import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Empty } from 'antd';
import { BRAND, useThemeMode } from '../context/ThemeContext';
import { money, monthLabel } from '../utils/format';
import { useCurrency } from './common';

function useChartColors() {
  const { mode } = useThemeMode();
  return mode === 'dark'
    ? { grid: '#22302e', text: '#9fb1ae', tooltipBg: '#132120' }
    : { grid: '#e6ecea', text: '#5b6b68', tooltipBg: '#ffffff' };
}

/** Income vs expenses for the last 6 months. */
export function TrendChart({ data }) {
  const currency = useCurrency();
  const c = useChartColors();
  const rows = data.map((d) => ({ ...d, label: monthLabel(d.month, 'MMM') }));
  if (!rows.some((r) => r.income || r.expense)) return <Empty description="No history yet" />;
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={rows} barGap={4} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke={c.grid} />
        <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: c.text, fontSize: 12 }} />
        <YAxis
          tickLine={false}
          axisLine={false}
          width={56}
          tick={{ fill: c.text, fontSize: 12 }}
          tickFormatter={(v) => money(v, currency, { compact: true })}
        />
        <Tooltip
          cursor={{ fill: c.grid, opacity: 0.5 }}
          contentStyle={{ background: c.tooltipBg, borderRadius: 10, border: `1px solid ${c.grid}` }}
          formatter={(v, name) => [money(v, currency), name === 'income' ? 'Income' : 'Expenses']}
          labelFormatter={(_, p) => (p?.[0] ? monthLabel(p[0].payload.month) : '')}
        />
        <Legend formatter={(v) => (v === 'income' ? 'Income' : 'Expenses')} iconType="circle" />
        <Bar dataKey="income" fill={BRAND.income} radius={[6, 6, 0, 0]} maxBarSize={28} isAnimationActive={false} />
        <Bar dataKey="expense" fill={BRAND.expense} radius={[6, 6, 0, 0]} maxBarSize={28} isAnimationActive={false} />
      </BarChart>
    </ResponsiveContainer>
  );
}

/** Where the month's money went, by category. */
export function CategoryDonut({ data, total }) {
  const currency = useCurrency();
  const c = useChartColors();
  if (!data.length) return <Empty description="No expenses this month" />;
  return (
    <div className="donut-wrap">
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie data={data} dataKey="amount" nameKey="category" innerRadius={62} outerRadius={92} paddingAngle={2} stroke="none" isAnimationActive={false}>
            {data.map((d) => (
              <Cell key={d.category} fill={d.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ background: c.tooltipBg, borderRadius: 10, border: `1px solid ${c.grid}` }}
            formatter={(v, name) => [`${money(v, currency)} (${Math.round((v / total) * 100)}%)`, name]}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="donut-center" aria-hidden="true">
        <span>Spent</span>
        <strong>{money(total, currency, { compact: true })}</strong>
      </div>
      <ul className="legend-list">
        {data.slice(0, 6).map((d) => (
          <li key={d.category}>
            <span className="dot" style={{ background: d.color }} />
            <span className="legend-name">{d.category}</span>
            <span className="legend-value">{Math.round((d.amount / total) * 100)}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
