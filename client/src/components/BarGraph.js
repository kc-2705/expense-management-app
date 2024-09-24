import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const BarGraph = ({ frequency, incomeData = [], expenseData = [], labels = [], currentPeriod }) => {
  if (labels.length === 0) {
    return <div>No data available for this period</div>;
  }

  const data = {
    labels,
    datasets: [
      {
        label: 'Income',
        data: incomeData,
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
      {
        label: 'Expenses',
        data: expenseData,
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: `Income and Expenses for ${frequency}` },
    },
    scales: {
      y: { beginAtZero: true },
    },
  };


  return (
    <div style={{ height: '500px', width: '800px', margin: '0 auto' }}>
      <h3>{`Displaying data for ${currentPeriod.format(frequency === '7' ? 'MMMM D, YYYY' : frequency === '30' ? 'MMMM YYYY' : 'YYYY')}`}</h3>
      <Bar data={data} options={options} />
    </div>
  );
};

export default BarGraph;
