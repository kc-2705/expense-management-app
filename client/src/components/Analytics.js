import React, { useState, useMemo, useCallback } from 'react';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import BarGraph from './BarGraph';
import moment from 'moment';

const Analytics = ({ allTransaction, frequency }) => {
  console.log('all transactions list for', allTransaction);
  const [currentPeriod, setCurrentPeriod] = useState(() => moment().startOf(frequency || 'month'));

  const getBarData = useCallback(() => {
    let labels = [];
    let incomeData = [];
    let expenseData = [];

    const groupedData = (transactions, dateFormat) => {
      return transactions.reduce((acc, transaction) => {
        const dateKey = moment(transaction.date).format(dateFormat);
        if (!acc[dateKey]) acc[dateKey] = { income: 0, expense: 0 };
        acc[dateKey][transaction.type] += transaction.amount;
        return acc;
      }, {});
    };

    if (!currentPeriod || !moment.isMoment(currentPeriod)) {
      console.log("Invalid current period");
      return { labels: [], incomeData: [], expenseData: [] };
    }

    let dateFormat;
    let periodStart, periodEnd;

    // Determine the date format and period range based on frequency
    if (frequency === 'all') {
      dateFormat = 'YYYY';
      labels = Array.from(new Set(allTransaction.map(transaction => moment(transaction.date).format(dateFormat))));
      const allData = groupedData(allTransaction, dateFormat);
      labels.forEach(label => {
        const data = allData[label] || { income: 0, expense: 0 };
        incomeData.push(data.income);
        expenseData.push(data.expense);
      });
    } else {
      if (frequency === '7') {
        dateFormat = 'YYYY-MM-DD';
        periodStart = currentPeriod.clone().startOf('week');
        periodEnd = currentPeriod.clone().endOf('week');
        labels = Array.from({ length: 7 }, (_, i) => periodStart.clone().add(i, 'days').format(dateFormat));
        const weekData = allTransaction.filter(transaction => {
          const date = moment(transaction.date);
          return date.isBetween(periodStart, periodEnd, 'day', '[]');
        });
        const weekGrouped = groupedData(weekData, dateFormat);
        labels.forEach(label => {
          const entry = weekGrouped[label] || { income: 0, expense: 0 };
          incomeData.push(entry.income);
          expenseData.push(entry.expense);
        });
      } else if (frequency === '30') {
        dateFormat = 'YYYY-MM-DD';
        const currentMonthStart = currentPeriod.clone().startOf('month');
        const currentMonthEnd = currentPeriod.clone().endOf('month');
        labels = Array.from({ length: currentMonthEnd.date() }, (_, i) => currentMonthStart.clone().add(i, 'days').format(dateFormat));
        const currentMonthData = allTransaction.filter(transaction => {
          const date = moment(transaction.date);
          return date.isBetween(currentMonthStart, currentMonthEnd, 'day', '[]');
        });
        const monthGrouped = groupedData(currentMonthData, dateFormat);
        labels.forEach(label => {
          const entry = monthGrouped[label] || { income: 0, expense: 0 };
          incomeData.push(entry.income);
          expenseData.push(entry.expense);
        });
      } else if (frequency === '365') {
        dateFormat = 'YYYY';
        periodStart = currentPeriod.clone().startOf('year');
        periodEnd = currentPeriod.clone().endOf('year');
        labels = Array.from({ length: 6 }, (_, i) => periodStart.clone().subtract(5 - i, 'years').format(dateFormat));
        const yearData = allTransaction.filter(transaction => {
          const date = moment(transaction.date);
          return date.isBetween(periodStart, periodEnd, 'day', '[]');
        });
        const yearGrouped = groupedData(yearData, dateFormat);
        labels.forEach(label => {
          const entry = yearGrouped[label] || { income: 0, expense: 0 };
          incomeData.push(entry.income);
          expenseData.push(entry.expense);
        });
      }
    }

    return { labels, incomeData, expenseData };
  }, [currentPeriod, frequency, allTransaction]);

  const handleScroll = useCallback((direction) => {
    let newPeriod;
    if (frequency === '7') {
      newPeriod = currentPeriod.clone().add(direction === 'left' ? -1 : 1, 'week');
    } else if (frequency === '30') {
      newPeriod = currentPeriod.clone().add(direction === 'left' ? -1 : 1, 'month');
    } else if (frequency === '365') {
      newPeriod = currentPeriod.clone().add(direction === 'left' ? -1 : 1, 'year');
    }
    setCurrentPeriod(newPeriod);
  }, [currentPeriod, frequency]);

  const { labels, incomeData, expenseData } = useMemo(() => getBarData(), [getBarData]);

  return (
    <div>
      <h2>Analytics</h2>
      <BarGraph
        frequency={frequency}
        incomeData={incomeData}
        expenseData={expenseData}
        labels={labels}
        currentPeriod={currentPeriod}  /* Pass current period to display */
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
        <LeftOutlined onClick={() => handleScroll('left')} style={{ cursor: 'pointer' }} />
        <RightOutlined onClick={() => handleScroll('right')} style={{ cursor: 'pointer' }} />
      </div>
    </div>
  );
};

export default Analytics;
