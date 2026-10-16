import { useState } from 'react';
import { Alert, App, Button, Modal, Space, Table, Tag, Tooltip, Typography, Upload } from 'antd';
import { InboxOutlined, RobotOutlined } from '@ant-design/icons';
import { useAiCategorize, useAiStatus, useCategories, useImportTransactions } from '../api/hooks';
import { errorMessage } from '../api/client';
import { parseCsv } from '../utils/exporters';
import { Amount } from './common';
import { showDate } from '../utils/format';

/** Upload a CSV, preview what will be added (optionally sorted by the local AI), then import it in one request. */
export default function ImportModal({ open, onClose }) {
  const { message } = App.useApp();
  const { data: categories = [] } = useCategories();
  const { data: ai } = useAiStatus();
  const importRows = useImportTransactions();
  const categorize = useAiCategorize();
  const [parsed, setParsed] = useState(null);
  const [error, setError] = useState(null);
  const [aiDone, setAiDone] = useState(false);

  const close = () => {
    setParsed(null);
    setError(null);
    setAiDone(false);
    onClose();
  };

  async function read(file) {
    setError(null);
    setAiDone(false);
    try {
      const result = await parseCsv(file);
      // Rows with a category the user doesn't have go to "Other" / "Other income".
      const known = new Set(categories.map((c) => `${c.type}:${c.name}`));
      result.rows = result.rows.map((r) =>
        known.has(`${r.type}:${r.category}`) ? r : { ...r, category: r.type === 'income' ? 'Other income' : 'Other' },
      );
      setParsed({ ...result, fileName: file.name });
    } catch (e) {
      setError(e.message);
    }
    return false; // stop Upload from sending the file anywhere
  }

  async function autoCategorize() {
    try {
      const suggestions = await categorize.mutateAsync(
        parsed.rows.map(({ type, amount, category, description }) => ({ type, amount, category, description })),
      );
      const rows = parsed.rows.map((r, i) => {
        const s = suggestions.find((x) => x.index === i);
        return s ? { ...r, category: s.category, business: s.business, aiChanged: s.changed } : r;
      });
      setParsed({ ...parsed, rows });
      setAiDone(true);
      const changed = suggestions.filter((s) => s.changed).length;
      const business = suggestions.filter((s) => s.business).length;
      message.success(`AI updated ${changed} categories and flagged ${business} possible business expenses.`);
    } catch (e) {
      message.error(errorMessage(e));
    }
  }

  async function confirm() {
    try {
      const rows = parsed.rows.map(({ aiChanged: _aiChanged, ...r }) => r);
      const res = await importRows.mutateAsync(rows);
      message.success(`Imported ${res.inserted} transactions`);
      close();
    } catch (e) {
      message.error(errorMessage(e));
    }
  }

  const aiButton = (
    <Tooltip title={ai?.available ? `Runs ${ai.model} on this computer. Your data stays private.` : ai?.reason}>
      <Button
        icon={<RobotOutlined />}
        onClick={autoCategorize}
        loading={categorize.isPending}
        disabled={!ai?.available || aiDone}
      >
        {categorize.isPending ? 'Sorting with local AI…' : aiDone ? 'Sorted by AI' : 'Auto-categorize with AI'}
      </Button>
    </Tooltip>
  );

  return (
    <Modal
      title="Import transactions from CSV"
      open={open}
      onCancel={close}
      onOk={confirm}
      okText={parsed ? `Import ${parsed.rows.length} transactions` : 'Import'}
      okButtonProps={{ disabled: !parsed?.rows.length || categorize.isPending }}
      confirmLoading={importRows.isPending}
      width={760}
      destroyOnHidden
    >
      {!parsed ? (
        <>
          <Upload.Dragger accept=".csv,text/csv" showUploadList={false} beforeUpload={read} maxCount={1}>
            <p className="ant-upload-drag-icon"><InboxOutlined /></p>
            <p className="ant-upload-text">Click or drop a CSV file here</p>
            <p className="ant-upload-hint">
              Needs a <b>Date</b> column and an <b>Amount</b> column (negative = money out), or <b>Debit</b>/<b>Credit</b> columns.
              Optional: Description, Category, Type.
            </p>
          </Upload.Dragger>
          {error && <Alert type="error" title={error} showIcon style={{ marginTop: 16 }} />}
        </>
      ) : (
        <>
          <Space style={{ width: '100%', justifyContent: 'space-between', marginBottom: 12 }} wrap>
            <Typography.Text>
              <b>{parsed.fileName}</b>: {parsed.rows.length} rows ready
              {parsed.skipped.length ? `, ${parsed.skipped.length} skipped` : ''}.
            </Typography.Text>
            {aiButton}
          </Space>
          {parsed.skipped.length > 0 && (
            <Alert
              type="warning"
              showIcon
              style={{ marginBottom: 12 }}
              title={`Skipped lines: ${parsed.skipped.slice(0, 5).map((s) => `${s.line} (${s.reason})`).join(', ')}${parsed.skipped.length > 5 ? '…' : ''}`}
            />
          )}
          {aiDone && (
            <Alert
              type="info"
              showIcon
              style={{ marginBottom: 12 }}
              title="Check the AI suggestions before importing. You can change any transaction later."
            />
          )}
          <Table
            size="small"
            rowKey={(_, i) => i}
            pagination={parsed.rows.length > 8 ? { pageSize: 8, size: 'small' } : false}
            dataSource={parsed.rows}
            scroll={{ x: true }}
            columns={[
              { title: 'Date', dataIndex: 'date', render: (d) => showDate(d) },
              { title: 'Description', dataIndex: 'description', ellipsis: true },
              {
                title: 'Category',
                dataIndex: 'category',
                render: (c, r) => (
                  <Space size={4}>
                    {c}
                    {r.aiChanged && <Tag color="purple" variant="filled">AI</Tag>}
                  </Space>
                ),
              },
              {
                title: 'Business',
                dataIndex: 'business',
                render: (b) => (b ? <Tag color="gold" variant="filled">Business</Tag> : null),
              },
              { title: 'Amount', dataIndex: 'amount', align: 'right', render: (v, r) => <Amount value={v} type={r.type} /> },
            ]}
          />
        </>
      )}
    </Modal>
  );
}
