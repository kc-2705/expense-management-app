import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Alert, Button, Card, Col, Empty, Row, Skeleton } from 'antd';
import { ArrowDownOutlined, ArrowUpOutlined, PercentageOutlined, PlusOutlined, WalletOutlined } from '@ant-design/icons';
import { useSummary } from '../api/hooks';
import { errorMessage } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Amount, MonthSwitcher, PageHeader, StatCard, useCategoryLookup } from '../components/common';
import { CategoryDonut, TrendChart } from '../components/Charts';
import BudgetBar from '../components/BudgetBar';
import CategoryIcon from '../components/CategoryIcon';
import { useOpenTransaction } from '../components/TransactionModal';
import { currentMonth, monthLabel, showDate } from '../utils/format';

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
}

export default function Dashboard() {
  const { user } = useAuth();
  const [month, setMonth] = useState(currentMonth());
  const { data, isLoading, error } = useSummary(month);
  const openTransaction = useOpenTransaction();
  const lookup = useCategoryLookup();

  const header = (
    <PageHeader
      title={`${greeting()}, ${user?.name?.split(' ')[0] ?? ''}`}
      subtitle={`Here’s your money in ${monthLabel(month)}.`}
      extra={<MonthSwitcher value={month} onChange={setMonth} />}
    />
  );

  if (error) return <>{header}<Alert type="error" title={errorMessage(error)} showIcon /></>;
  if (isLoading || !data) return <>{header}<Skeleton active paragraph={{ rows: 10 }} /></>;

  const alerts = data.budgets.filter((b) => b.status !== 'ok');
  const savings = data.savingsRate;
  const prevSavings = data.previous.income > 0 ? Math.round(((data.previous.income - data.previous.expense) / data.previous.income) * 100) : undefined;

  return (
    <>
      {header}

      {alerts.length > 0 && (
        <Alert
          type={alerts.some((b) => b.status === 'over') ? 'error' : 'warning'}
          showIcon
          style={{ marginBottom: 16 }}
          title={
            alerts.length === 1
              ? `${alerts[0].category} is at ${alerts[0].percent}% of its budget.`
              : `${alerts.length} budgets need attention: ${alerts.map((b) => `${b.category} (${b.percent}%)`).join(', ')}.`
          }
          action={<Link to="/budgets"><Button size="small">View budgets</Button></Link>}
        />
      )}

      <div className="stat-grid">
        <StatCard label="Income" value={data.income} previous={data.previous.income} icon={<ArrowDownOutlined />} tone="income" />
        <StatCard label="Expenses" value={data.expense} previous={data.previous.expense} icon={<ArrowUpOutlined />} tone="expense" goodWhen="down" />
        <StatCard label="Balance" value={data.balance} previous={data.previous.income - data.previous.expense} icon={<WalletOutlined />} tone="primary" />
        <StatCard label="Savings rate" value={savings} previous={prevSavings} icon={<PercentageOutlined />} suffix="%" />
      </div>

      {data.count === 0 ? (
        <Card style={{ marginTop: 16 }}>
          <Empty description={`No transactions in ${monthLabel(month)} yet.`}>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => openTransaction()}>Add your first transaction</Button>
          </Empty>
        </Card>
      ) : null}

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} xl={15}>
          <Card title="Income vs expenses" extra={<span className="muted">Last 6 months</span>}>
            <TrendChart data={data.trend} />
          </Card>
        </Col>
        <Col xs={24} xl={9}>
          <Card title="Spending by category">
            <CategoryDonut data={data.byCategory} total={data.expense} />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Budgets" extra={<Link to="/budgets">Manage</Link>}>
            {data.budgets.length ? (
              <div className="stack">
                {[...data.budgets].sort((a, b) => b.percent - a.percent).slice(0, 5).map((b) => (
                  <BudgetBar key={b._id} budget={b} />
                ))}
              </div>
            ) : (
              <Empty description="No budgets yet">
                <Link to="/budgets"><Button>Set a budget</Button></Link>
              </Empty>
            )}
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Biggest expenses" extra={<Link to="/transactions">See all</Link>}>
            {data.topExpenses.length ? (
              <ul className="tx-list">
                {data.topExpenses.map((t) => {
                  const cat = lookup('expense', t.category);
                  return (
                    <li key={t._id}>
                      <button type="button" className="tx-row" onClick={() => openTransaction(t)}>
                        <CategoryIcon icon={cat.icon} color={cat.color} />
                        <span className="tx-text">
                          <strong>{t.description || t.category}</strong>
                          <span>{t.category} · {showDate(t.date, 'MMM D')}</span>
                        </span>
                        <Amount value={t.amount} type="expense" />
                      </button>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <Empty description="No expenses this month" />
            )}
          </Card>
        </Col>
      </Row>
    </>
  );
}
