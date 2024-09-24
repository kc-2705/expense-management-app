import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout/Layout';
import { Form, Input, message, Modal, Select, Table, DatePicker, Button, Checkbox, Typography, Radio, Cascader } from 'antd';
import axios from 'axios';
import Spinner from '../components/Spinner';
import moment from 'moment';
import { UnorderedListOutlined, AreaChartOutlined, EditOutlined, DeleteOutlined, FilterOutlined, PieChartOutlined } from '@ant-design/icons';
import Analytics from '../components/Analytics';
import PieChart from '../components/Piechart';
import '../index.css';

const { RangePicker } = DatePicker;
const { Option } = Select;
const { Title } = Typography;

const HomePage = () => {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [allTransaction, setAllTransaction] = useState([]);
  const [frequency, setFrequency] = useState('all');
  const [selectedDate, setSelectedDate] = useState([]);
  const [type, setType] = useState('all');
  const [viewData, setViewData] = useState('table');
  const [editable, setEditable] = useState(null);
  const [totals, setTotals] = useState({ income: 0, expenses: 0, balance: 0 });
  const [pieChartType, setPieChartType] = useState('all');
  const [filters, setFilters] = useState({
    category: [],
    type: [],
    reference: '',
    description: '',
    dateFilter: { year: null, month: null, date: null }
  });


  // Get unique categories and types for filters
  const uniqueCategories = [...new Set(allTransaction.map(t => t.category))];
  const uniqueTypes = [...new Set(allTransaction.map(t => t.type))];

  // Handle checkbox filter change for category and type
  const handleCheckboxChange = (name, checkedValues) => {
    setFilters({
      ...filters,
      [name]: checkedValues
    });
  };

  // Filtered data based on the filters
  const filteredData = allTransaction.filter(transaction => {
    const transactionDate = moment(transaction.date);
    return (
      (filters.category.length === 0 || filters.category.includes(transaction.category)) &&
      (filters.type.length === 0 || filters.type.includes(transaction.type)) &&
      (filters.reference === '' || transaction.reference.toLowerCase().includes(filters.reference.toLowerCase())) &&
      (filters.description === '' || transaction.description.toLowerCase().includes(filters.description.toLowerCase())) &&
      (!filters.dateFilter.year || transactionDate.year() === filters.dateFilter.year) &&
      (!filters.dateFilter.month || transactionDate.month() + 1 === filters.dateFilter.month) &&
      (!filters.dateFilter.date || transactionDate.date() === filters.dateFilter.date)
    );
  });

  // Table columns
  const columns = [
    {
      title: 'Date',
      dataIndex: 'date',
      render: (text) => <span>{moment(text).format('YYYY-MM-DD')}</span>,
      filterIcon: () => <FilterOutlined />,
      filterDropdown: () => (
        <div style={{ padding: 8 }}>
          <DatePicker
            picker='year'
            onChange={(date) => setFilters(prevFilters => ({ ...prevFilters, dateFilter: { ...prevFilters.dateFilter, year: date ? date.year() : null } }))}
            placeholder='Select Year'
            style={{ marginBottom: 8, display: 'block' }}
          />
          <DatePicker
            picker='month'
            onChange={(date) => setFilters(prevFilters => ({ ...prevFilters, dateFilter: { ...prevFilters.dateFilter, month: date ? date.month() + 1 : null } }))}
            placeholder='Select Month'
            style={{ marginBottom: 8, display: 'block' }}
          />
          <DatePicker
            picker='date'
            onChange={(date) => setFilters(prevFilters => ({ ...prevFilters, dateFilter: { ...prevFilters.dateFilter, date: date ? date.date() : null } }))}
            placeholder='Select Date'
            style={{ marginBottom: 8, display: 'block' }}
          />
        </div>
      )
    },
    {
      title: 'Amount',
      dataIndex: 'amount'
    },
    {
      title: 'Type',
      dataIndex: 'type',
      filterDropdown: () => (
        <Checkbox.Group
          options={uniqueTypes.map(type => ({ label: type, value: type }))}
          value={filters.type}
          onChange={(checkedValues) => handleCheckboxChange('type', checkedValues)}
        />
      )
    },
    {
      title: 'Category',
      dataIndex: 'category',
      filterDropdown: () => (
        <Checkbox.Group
          options={uniqueCategories.map(category => ({ label: category, value: category }))}
          value={filters.category}
          onChange={(checkedValues) => handleCheckboxChange('category', checkedValues)}
        />
      )
    },
    {
      title: 'Reference',
      dataIndex: 'reference',
      filterDropdown: () => (
        <Input
          placeholder='Filter by Reference'
          value={filters.reference}
          onChange={(e) => setFilters({ ...filters, reference: e.target.value })}
        />
      )
    },
    {
      title: 'Description',
      dataIndex: 'description',
      filterDropdown: () => (
        <Input
          placeholder='Filter by Description'
          value={filters.description}
          onChange={(e) => setFilters({ ...filters, description: e.target.value })}
        />
      )
    },
    {
      title: 'Actions',
      render: (text, record) => (
        <div>
          <EditOutlined onClick={() => { setEditable(record); setShowModal(true); }} />
          <DeleteOutlined className='mx-2' onClick={() => handleDelete(record)} />
        </div>
      )
    }
  ];

  // Get all transactions and calculate totals
  const getAllTransaction = async () => {
    try {
      setLoading(true);
      const user = JSON.parse(localStorage.getItem('user'));
      const requestPayload = {
        userid: user._id,
        type,
        frequency,
        selectedDate: selectedDate.length === 2 ? selectedDate : undefined,
      };
      const res = await axios.post('http://localhost:8080/api/v1/transactions/get-transaction', requestPayload);

      if (Array.isArray(res.data)) {
        setAllTransaction(res.data.map(transaction => ({ ...transaction, key: transaction._id })));
      } else {
        console.error('Unexpected response format:', res.data);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);

    } finally {
      setLoading(false);
    }
  };


  // Keep the rest of the code in homepage.js as is.
  // Ensure that getAllTransaction is optimized for performance.

  useEffect(() => {
    getAllTransaction();
  }, [frequency, selectedDate, type, filters]);

  // Delete handler
  const handleDelete = async (record) => {
    try {
      setLoading(true);
      await axios.post('http://localhost:8080/api/v1/transactions/delete-transaction', { transactionId: record._id });
      setLoading(false);
      message.success('Transaction deleted successfully');
      setAllTransaction(prevTransactions => prevTransactions.filter(transaction => transaction._id !== record._id));
    } catch (error) {
      setLoading(false);
      console.log(error);
      message.error('Unable to delete');
    }
  };

  // Form handling
  const handleSubmit = async (values) => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      setLoading(true);
      const requestPayload = {
        userid: user._id,
        date: values.date.format('YYYY-MM-DD'),
        amount: values.amount,
        type: values.type,
        category: values.category,
        reference: values.reference || '', // Provide a default value if not present
        description: values.description || '',
      };

      if (editable) {
        await axios.post('http://localhost:8080/api/v1/transactions/edit-transaction', {
          payload: requestPayload,
          transactionId: editable._id
        });
        message.success('Transaction Updated Successfully');
        getAllTransaction();
      } else {
        const res = await axios.post('http://localhost:8080/api/v1/transactions/add-transaction', requestPayload);
        message.success('Transaction Added Successfully');
        setAllTransaction([...allTransaction, { ...values, _id: res.data._id }]);
      }
      setShowModal(false);
      setEditable(null);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      message.error('Failed to add or update transaction');
      console.error('Error:', error.response ? error.response.data : error.message);
    }
  };

  const disabledFutureDate = (current) => {
    return current && current > moment().endOf('day'); // Disable dates after today
  };

  return (
    <Layout>
      {loading && <Spinner />}
      <div className='filters'>
        <div className='filter-buttons-container'>
          <div className='filter-item'>
            <h6>Select Frequency</h6>
            <div className='frequency-buttons'>
              <Button
                className={`frequency-button ${frequency === 'all' ? 'active' : ''}`}
                onClick={() => setFrequency('all')}>All
              </Button>
              <Button
                className={`frequency-button ${frequency === '7' ? 'active' : ''}`}
                onClick={() => setFrequency('7')}>Week
              </Button>
              <Button
                className={`frequency-button ${frequency === '30' ? 'active' : ''}`}
                onClick={() => setFrequency('30')}>Month
              </Button>
              <Button
                className={`frequency-button ${frequency === '365' ? 'active' : ''}`}
                onClick={() => setFrequency('365')}>Year
              </Button>
              <Button
                className={`frequency-button ${frequency === 'custom' ? 'active' : ''}`}
                onClick={() => setFrequency('custom')}>Custom
              </Button>
            </div>
            {frequency === 'custom' && (
              <RangePicker
                value={selectedDate}
                onChange={(values) => setSelectedDate(values)}
                className='form-select'
              />
            )}
          </div>
          <div className='filter-item'>
            <h6>Select Type</h6>
            <div className='frequency-buttons'>
              <Button
                className={`frequency-button ${type === 'all' ? 'active' : ''}`}
                onClick={() => setType('all')}>All
              </Button>
              <Button
                className={`frequency-button ${type === 'income' ? 'active' : ''}`}
                onClick={() => setType('income')}>Income
              </Button>
              <Button
                className={`frequency-button ${type === 'expense' ? 'active' : ''}`}
                onClick={() => setType('expense')}>Expense
              </Button>
            </div>
          </div>
          <div className='switch-icon'>
            <UnorderedListOutlined
              className={`mx-2 ${viewData === 'table' ? 'active-icon' : 'inactive-icon'}`}
              onClick={() => setViewData('table')} />
            <AreaChartOutlined
              className={`mx-2 ${viewData === 'analytics' ? 'active-icon' : 'inactive-icon'}`}
              onClick={() => setViewData('analytics')} />
          </div>
          <div>
            <button className='btn-green' onClick={() => setShowModal(true)}>
              Add New
            </button>
          </div>
        </div>
      </div>
      <div className='main-content'>
        <div className='totals'>
          <div>
            <h6>Select Pie Chart Data</h6>
            <Radio.Group onChange={(e) => setPieChartType(e.target.value)} value={pieChartType}>
              <Radio value='income'>Income</Radio>
              <Radio value='expense'>Expenses</Radio>
              <Radio value='all'>All</Radio>
            </Radio.Group>
          </div>
          <PieChart
            data={filteredData.filter(transaction => pieChartType === 'all' || transaction.type === pieChartType)}
            chartType={pieChartType}
          />

        </div>
        <div className='content'>
          {viewData === 'analytics' && (
            <div className='charts-container'>
              <Analytics
                frequency={frequency}
                chartType={type}
                allTransaction={allTransaction}
              />
            </div>
          )}
          {viewData === 'table' && (
            <div>
              {filteredData.length === 0 ? (
                <Title level={4}>No Data Available</Title>
              ) : (
                <Table
                  columns={columns}
                  dataSource={filteredData}
                  pagination={{ pageSize: 8 }}
                />
              )}
            </div>
          )}
        </div>
      </div>
      <Modal
        title={editable ? 'Edit Transaction' : 'Add Transaction'}
        open={showModal}
        onCancel={() => setShowModal(false)}
        footer={null}
      >
        <Form
          key={editable ? editable._id : 'new'} // Ensure form key changes to force re-render
          layout='vertical'
          initialValues={editable ? { ...editable, date: moment(editable.date) } : {}}
          onFinish={handleSubmit}
        >
          <Form.Item
            label='Date'
            name='date'
            rules={[{ required: true, message: 'Please select date!' }]}
          >
            <DatePicker format='YYYY-MM-DD' disabledDate={disabledFutureDate}/>
          </Form.Item>
          <Form.Item
            label='Amount'
            name='amount'
            rules={[{ required: true, message: 'Please input amount!' }]}
          >
            <Input type='number' />
          </Form.Item>
          <Form.Item
            label='Type'
            name='type'
            rules={[{ required: true, message: 'Please select type!' }]}
          >
            <Select>
              <Option value='income'>Income</Option>
              <Option value='expense'>Expense</Option>
            </Select>
          </Form.Item>
          <Form.Item
            label='Category'
            name='category'
            rules={[{ required: true, message: 'Please select category!' }]}
          >
            <Select>
              <Option value='Food'>Food</Option>
              <Option value='Grocery'>Grocery</Option>
              <Option value='Entertainment'>Entertainment</Option>
              <Option value='Fee'>Fee</Option>
              <Option value='Bills'>Bills</Option>
              <Option value='Home'>Home</Option>
              <Option value='Shopping'>Shopping</Option>
              <Option value='Travel'>Travel</Option>
              <Option value='Others'>Others</Option>
            </Select>
          </Form.Item>
          <Form.Item
            label='Reference'
            name='reference'
          >
            <Input />
          </Form.Item>
          <Form.Item
            label='Description'
            name='description'
          >
            <Input.TextArea />
          </Form.Item>
          <Form.Item>
            <Button type='primary' htmlType='submit'>
              {editable ? 'Update' : 'Add'}
            </Button>
          </Form.Item>
        </Form>
      </Modal>

    </Layout>
  );
};

export default HomePage;
