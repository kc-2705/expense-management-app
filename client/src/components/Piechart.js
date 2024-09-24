import React from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement } from 'chart.js';

ChartJS.register(Title, Tooltip, Legend, ArcElement);

const PieChart = ({ data, chartType = 'all' }) => {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return <div>No data available</div>;
  }

  let labels = [];
  let dataset = [];
  let totalAmount = 0;

  const colors = ['#ff6384', '#36a2eb', '#cc65fe', '#ffce56', '#e6e6e6', '#1f77b4', '#2ca02c', '#d62728', '#9467bd', '#8c564b'];

  if (chartType === 'income' || chartType === 'expense') {
    const filteredData = data.filter(transaction => transaction.type === chartType);
    labels = Array.from(new Set(filteredData.map(transaction => transaction.category)));
    dataset = labels.map(label => {
      return filteredData
        .filter(transaction => transaction.category === label)
        .reduce((acc, transaction) => acc + transaction.amount, 0);
    });
    totalAmount = dataset.reduce((acc, amount) => acc + amount, 0);
  } else if (chartType === 'all') {
    labels = Array.from(new Set(data.map(transaction => transaction.category)));
    dataset = labels.map(label => {
      const income = data.filter(transaction => transaction.type === 'income' && transaction.category === label)
                         .reduce((acc, transaction) => acc + transaction.amount, 0);
      const expense = data.filter(transaction => transaction.type === 'expense' && transaction.category === label)
                          .reduce((acc, transaction) => acc + transaction.amount, 0);
      return income - expense;
    });
    totalAmount = dataset.reduce((acc, amount) => acc + amount, 0);
  }

  const chartData = {
    labels: labels,
    datasets: [{
      data: dataset,
      backgroundColor: colors.slice(0, labels.length),
      borderColor: '#fff',
      borderWidth: 1,
    }],
  };

  const options = {
    plugins: {
      tooltip: {
        callbacks: {
          label: function(tooltipItem) {
            const datasetLabel = tooltipItem.dataset.label || '';
            const value = tooltipItem.raw;
            const percentage = ((value / totalAmount) * 100).toFixed(2);
            return `${datasetLabel}: $${value} (${percentage}%)`;
          }
        }
      }
    }
  };

  return (
    <div className='pie-chart-container'>
      {chartData.labels.length > 0 ? (
        <div className='pie-chart'>
          <Pie data={chartData} options={options} />
          <div className='chart-details'>
            {labels.map((label, index) => (
              <div key={label} className='chart-detail'>
                <div className='color-swatch' style={{ backgroundColor: colors[index] }}></div>
                <span className='category'>{label}</span>
                <span className='amount'>${dataset[index]}</span>
                <span className='percentage'>
                  {((dataset[index] / totalAmount) * 100).toFixed(2)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div>No data available</div>
      )}
    </div>
  );
};

export default PieChart;
