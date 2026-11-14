import { useState } from 'react';
import { Button } from 'antd';
import { DownloadOutlined, PlusOutlined } from '@ant-design/icons';
import { MonthSwitcher, PageHeader } from './common';
import { currentMonth } from '../utils/format';

export default {
  title: 'Inputs/PageHeader & MonthSwitcher',
  component: PageHeader,
  args: { title: 'Transactions', subtitle: 'Everything you earned and spent' },
};

export const TitleOnly = { args: { subtitle: undefined } };

export const WithSubtitle = {};

/** Actions wrap under the title on narrow screens. */
export const WithActions = {
  args: {
    extra: [
      <Button key="export" icon={<DownloadOutlined />}>Export</Button>,
      <Button key="add" type="primary" icon={<PlusOutlined />}>Add transaction</Button>,
    ],
  },
};

/** Pick a month with the arrows or the picker. You can't go past the current month. */
export const MonthPicker = {
  parameters: { controls: { disable: true } },
  render: function Render() {
    const [month, setMonth] = useState(currentMonth());
    return <PageHeader title="Dashboard" subtitle="Your month at a glance" extra={<MonthSwitcher value={month} onChange={setMonth} />} />;
  },
};
