import { useState } from 'react';
import { Alert, App, Modal, Table, Typography, Upload } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import { useCategories, useImportTransactions } from '../api/hooks';
import { errorMessage } from '../api/client';
import { parseCsv } from '../utils/exporters';
import { Amount } from './common';
import { showDate } from '../utils/format';

/** Upload a CSV, preview what will be added, then import it in one request. */
export default function ImportModal({ open, onClose }) {
  const { message } = App.useApp();
  const { data: categories = [] } = useCategories();
  const importRows = useImportTransactions();
  const [parsed, setParsed] = useState(null);
  const [error, setError] = useState(null);

  const close = () => {
    setParsed(null);
    setError(null);
    onClose();
  };

  async function read(file) {
    setError(null);
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

  async function confirm() {
    try {
      const res = await importRows.mutateAsync(parsed.rows);
      message.success(`Imported ${res.inserted} transactions`);
      close();
    } catch (e) {
      message.error(errorMessage(e));
    }
  }

  return (
    <Modal
      title="Import transactions from CSV"
      open={open}
      onCancel={close}
      onOk={confirm}
      okText={parsed ? `Import ${parsed.rows.length} transactions` : 'Import'}
      okButtonProps={{ disabled: !parsed?.rows.length }}
      confirmLoading={importRows.isPending}
      width={720}
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
          <Typography.Paragraph>
            <b>{parsed.fileName}</b>: {parsed.rows.length} rows ready
            {parsed.skipped.length ? `, ${parsed.skipped.length} skipped` : ''}. Here are the first 8.
          </Typography.Paragraph>
          {parsed.skipped.length > 0 && (
            <Alert
              type="warning"
              showIcon
              style={{ marginBottom: 12 }}
              title={`Skipped lines: ${parsed.skipped.slice(0, 5).map((s) => `${s.line} (${s.reason})`).join(', ')}${parsed.skipped.length > 5 ? '…' : ''}`}
            />
          )}
          <Table
            size="small"
            rowKey={(_, i) => i}
            pagination={false}
            dataSource={parsed.rows.slice(0, 8)}
            scroll={{ x: true }}
            columns={[
              { title: 'Date', dataIndex: 'date', render: (d) => showDate(d) },
              { title: 'Description', dataIndex: 'description', ellipsis: true },
              { title: 'Category', dataIndex: 'category' },
              { title: 'Amount', dataIndex: 'amount', align: 'right', render: (v, r) => <Amount value={v} type={r.type} /> },
            ]}
          />
        </>
      )}
    </Modal>
  );
}
