import { useMemo, useState } from 'react';
import { App, Button, Card, DatePicker, Dropdown, Empty, Input, Popconfirm, Segmented, Select, Space, Table, Tag, Tooltip } from 'antd';
import {
  DeleteOutlined,
  DownloadOutlined,
  EditOutlined,
  FileExcelOutlined,
  FilePdfOutlined,
  PlusOutlined,
  RetweetOutlined,
  SearchOutlined,
  ShoppingOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import { fetchAllTransactions, useCategories, useDeleteTransaction, useTransactions } from '../api/hooks';
import { errorMessage } from '../api/client';
import { Amount, PageHeader, useCategoryLookup, useCurrency } from '../components/common';
import CategoryIcon from '../components/CategoryIcon';
import ImportModal from '../components/ImportModal';
import { useOpenTransaction } from '../components/TransactionModal';
import { exportCsv, exportPdf } from '../utils/exporters';
import { dayjs, money, showDate, toDayParam } from '../utils/format';

const PRESETS = [
  { label: 'This month', value: [dayjs().startOf('month'), dayjs()] },
  { label: 'Last month', value: [dayjs().subtract(1, 'month').startOf('month'), dayjs().subtract(1, 'month').endOf('month')] },
  { label: 'Last 30 days', value: [dayjs().subtract(29, 'day'), dayjs()] },
  { label: 'Last 90 days', value: [dayjs().subtract(89, 'day'), dayjs()] },
  { label: 'This year', value: [dayjs().startOf('year'), dayjs()] },
];

export default function Transactions() {
  const { message } = App.useApp();
  const currency = useCurrency();
  const lookup = useCategoryLookup();
  const openTransaction = useOpenTransaction();
  const { data: categories = [] } = useCategories();
  const remove = useDeleteTransaction();

  const [range, setRange] = useState(null);
  const [type, setType] = useState('all');
  const [cats, setCats] = useState([]);
  const [search, setSearch] = useState('');
  const [q, setQ] = useState('');
  const [sort, setSort] = useState('-date');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [importOpen, setImportOpen] = useState(false);
  const [exporting, setExporting] = useState(false);

  const filters = useMemo(
    () => ({
      from: toDayParam(range?.[0]),
      to: toDayParam(range?.[1]),
      type: type === 'all' ? undefined : type,
      category: cats.length ? cats.join(',') : undefined,
      q: q || undefined,
    }),
    [range, type, cats, q],
  );
  const { data, isFetching } = useTransactions({ ...filters, sort, page, limit: pageSize });
  const resetPage = (fn) => (...args) => {
    fn(...args);
    setPage(1);
  };
  const filtered = Boolean(range || type !== 'all' || cats.length || q);

  async function doExport(kind) {
    setExporting(true);
    try {
      const items = await fetchAllTransactions({ ...filters, sort });
      if (!items.length) return message.info('Nothing to export with these filters.');
      if (kind === 'csv') exportCsv(items);
      else exportPdf(items, { currency, title: range ? `${range[0].format('MMM D, YYYY')} – ${range[1].format('MMM D, YYYY')}` : 'All transactions' });
    } catch (e) {
      message.error(errorMessage(e));
    } finally {
      setExporting(false);
    }
  }

  async function onDelete(id) {
    try {
      await remove.mutateAsync(id);
      message.success('Transaction deleted');
    } catch (e) {
      message.error(errorMessage(e));
    }
  }

  const categoryOptions = categories
    .filter((c) => type === 'all' || c.type === type)
    .map((c) => ({ value: c.name, label: c.name }));
  const uniqueCategoryOptions = [...new Map(categoryOptions.map((o) => [o.value, o])).values()];

  const columns = [
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      width: 120,
      sorter: true,
      sortOrder: sort === 'date' ? 'ascend' : sort === '-date' ? 'descend' : null,
      render: (d) => <span className="nowrap">{showDate(d)}</span>,
    },
    {
      title: 'Transaction',
      key: 'what',
      render: (_, t) => {
        const cat = lookup(t.type, t.category);
        return (
          <Space size={12}>
            <CategoryIcon icon={cat.icon} color={cat.color} />
            <span className="tx-text">
              <strong>
                {t.description || t.category}
                {t.recurring && (
                  <Tooltip title="Added by a recurring payment">
                    <RetweetOutlined style={{ marginLeft: 6, opacity: 0.6 }} />
                  </Tooltip>
                )}
                {t.business && (
                  <Tooltip title="Possible business expense">
                    <ShoppingOutlined style={{ marginLeft: 6, opacity: 0.6 }} />
                  </Tooltip>
                )}
              </strong>
              <span>{t.category}</span>
            </span>
          </Space>
        );
      },
    },
    {
      title: 'Type',
      dataIndex: 'type',
      width: 100,
      responsive: ['md'],
      render: (t) => <Tag color={t === 'income' ? 'green' : 'red'} variant="filled">{t === 'income' ? 'Income' : 'Expense'}</Tag>,
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      align: 'right',
      width: 140,
      sorter: true,
      sortOrder: sort === 'amount' ? 'ascend' : sort === '-amount' ? 'descend' : null,
      render: (v, t) => <Amount value={v} type={t.type} />,
    },
    {
      title: '',
      key: 'actions',
      width: 96,
      align: 'right',
      render: (_, t) => (
        <Space size={0}>
          <Button type="text" icon={<EditOutlined />} onClick={() => openTransaction(t)} aria-label="Edit" />
          <Popconfirm title="Delete this transaction?" okText="Delete" okButtonProps={{ danger: true }} onConfirm={() => onDelete(t._id)}>
            <Button type="text" danger icon={<DeleteOutlined />} aria-label="Delete" />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Transactions"
        subtitle="Search, filter and edit everything you’ve recorded."
        extra={
          <>
            <Button icon={<UploadOutlined />} onClick={() => setImportOpen(true)}>Import CSV</Button>
            <Dropdown
              menu={{
                items: [
                  { key: 'csv', icon: <FileExcelOutlined />, label: 'CSV (Excel, Sheets)', onClick: () => doExport('csv') },
                  { key: 'pdf', icon: <FilePdfOutlined />, label: 'PDF report', onClick: () => doExport('pdf') },
                ],
              }}
            >
              <Button icon={<DownloadOutlined />} loading={exporting}>Export</Button>
            </Dropdown>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => openTransaction()}>Add</Button>
          </>
        }
      />

      <Card className="filters-card">
        <div className="filters">
          <Input
            allowClear
            prefix={<SearchOutlined />}
            placeholder="Search description or category"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              if (!e.target.value) resetPage(setQ)('');
            }}
            onPressEnter={() => resetPage(setQ)(search.trim())}
            onBlur={() => resetPage(setQ)(search.trim())}
            style={{ maxWidth: 280 }}
          />
          <DatePicker.RangePicker value={range} onChange={resetPage(setRange)} presets={PRESETS} format="MMM D, YYYY" allowEmpty={[false, false]} />
          <Segmented
            value={type}
            onChange={(v) => {
              resetPage(setType)(v);
              setCats([]);
            }}
            options={[
              { label: 'All', value: 'all' },
              { label: 'Expenses', value: 'expense' },
              { label: 'Income', value: 'income' },
            ]}
          />
          <Select
            mode="multiple"
            allowClear
            placeholder="Categories"
            value={cats}
            onChange={resetPage(setCats)}
            options={uniqueCategoryOptions}
            maxTagCount="responsive"
            style={{ minWidth: 200, flex: 1, maxWidth: 360 }}
          />
          {filtered && (
            <Button
              type="link"
              onClick={() => {
                setRange(null);
                setType('all');
                setCats([]);
                setSearch('');
                setQ('');
                setPage(1);
              }}
            >
              Clear filters
            </Button>
          )}
        </div>
        {data?.totals && (
          <div className="filter-totals">
            <span>{data.total} transactions</span>
            <span>In <b className="amount income">{money(data.totals.income, currency)}</b></span>
            <span>Out <b className="amount expense">{money(data.totals.expense, currency)}</b></span>
            <span>Net <b>{money(data.totals.income - data.totals.expense, currency)}</b></span>
          </div>
        )}
      </Card>

      <Card styles={{ body: { padding: 0 } }} style={{ marginTop: 16 }}>
        <Table
          rowKey="_id"
          columns={columns}
          dataSource={data?.items ?? []}
          loading={isFetching}
          scroll={{ x: 560 }}
          locale={{
            emptyText: (
              <Empty description={filtered ? 'No transactions match these filters.' : 'No transactions yet.'}>
                {!filtered && <Button type="primary" icon={<PlusOutlined />} onClick={() => openTransaction()}>Add a transaction</Button>}
              </Empty>
            ),
          }}
          onChange={(pagination, _f, sorter) => {
            if (sorter?.columnKey && sorter.order) {
              const next = (sorter.order === 'descend' ? '-' : '') + sorter.columnKey;
              if (next !== sort) {
                setSort(next);
                setPage(1);
                return;
              }
            } else if (sorter?.columnKey && !sorter.order) {
              setSort('-date');
            }
            setPage(pagination.current);
            setPageSize(pagination.pageSize);
          }}
          pagination={{
            current: page,
            pageSize,
            total: data?.total ?? 0,
            showSizeChanger: true,
            pageSizeOptions: [10, 20, 50, 100],
            showTotal: (total, [a, b]) => `${a}–${b} of ${total}`,
          }}
        />
      </Card>

      <ImportModal open={importOpen} onClose={() => setImportOpen(false)} />
    </>
  );
}
