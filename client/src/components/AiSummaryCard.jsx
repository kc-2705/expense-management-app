import { useEffect } from 'react';
import { Alert, Button, Card, Typography } from 'antd';
import { RobotOutlined } from '@ant-design/icons';
import { useAiStatus, useAiSummary } from '../api/hooks';
import { errorMessage } from '../api/client';
import { monthLabel } from '../utils/format';

/** A short plain-English recap of the month, written by a model running on this computer. */
export default function AiSummaryCard({ month }) {
  const { data: ai } = useAiStatus();
  const summary = useAiSummary();

  // A summary belongs to one month; clear it when the user switches months.
  useEffect(() => summary.reset(), [month]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!ai) return null;

  return (
    <Card
      style={{ marginTop: 16 }}
      title={<><RobotOutlined /> AI monthly summary</>}
      extra={<span className="muted">Private: runs on your computer</span>}
    >
      {!ai.available ? (
        <Typography.Text type="secondary">
          Install <a href="https://ollama.com" target="_blank" rel="noreferrer">Ollama</a> to get a plain-English recap of your month. {ai.reason}
        </Typography.Text>
      ) : summary.data ? (
        <>
          <Typography.Paragraph style={{ marginBottom: 8 }}>{summary.data.text}</Typography.Paragraph>
          <Button size="small" onClick={() => summary.mutate(month)} loading={summary.isPending}>Write again</Button>
        </>
      ) : (
        <>
          {summary.error && <Alert type="error" showIcon title={errorMessage(summary.error)} style={{ marginBottom: 12 }} />}
          <Button type="primary" icon={<RobotOutlined />} onClick={() => summary.mutate(month)} loading={summary.isPending}>
            {summary.isPending ? 'Writing…' : `Summarize ${monthLabel(month)}`}
          </Button>
        </>
      )}
    </Card>
  );
}
