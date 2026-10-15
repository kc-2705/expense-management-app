import { useState } from 'react';
import { App, Button, Card, Col, ColorPicker, Form, Input, Modal, Popconfirm, Row, Segmented, Space, Typography } from 'antd';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { useCategories, useDeleteCategory, useSaveCategory } from '../api/hooks';
import { errorMessage } from '../api/client';
import { PageHeader } from '../components/common';
import CategoryIcon, { COLOR_PRESETS, ICONS } from '../components/CategoryIcon';

export default function Categories() {
  const { message } = App.useApp();
  const { data = [], isLoading } = useCategories();
  const remove = useDeleteCategory();
  const [editing, setEditing] = useState(null);

  async function onDelete(cat) {
    try {
      await remove.mutateAsync(cat._id);
      message.success(`Deleted ${cat.name}`);
    } catch (e) {
      message.error(errorMessage(e));
    }
  }

  const column = (type, title) => (
    <Card title={title} loading={isLoading} extra={<Button size="small" icon={<PlusOutlined />} onClick={() => setEditing({ type })}>Add</Button>}>
      <ul className="cat-list">
        {data
          .filter((c) => c.type === type)
          .map((c) => (
            <li key={c._id}>
              <CategoryIcon icon={c.icon} color={c.color} />
              <Typography.Text strong className="cat-name">{c.name}</Typography.Text>
              <Space size={0}>
                <Button type="text" icon={<EditOutlined />} onClick={() => setEditing(c)} aria-label={`Edit ${c.name}`} />
                <Popconfirm title={`Delete ${c.name}?`} okText="Delete" okButtonProps={{ danger: true }} onConfirm={() => onDelete(c)}>
                  <Button type="text" danger icon={<DeleteOutlined />} aria-label={`Delete ${c.name}`} />
                </Popconfirm>
              </Space>
            </li>
          ))}
      </ul>
    </Card>
  );

  return (
    <>
      <PageHeader title="Categories" subtitle="Renaming a category also updates its transactions, budgets and recurring payments." />
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>{column('expense', 'Expense categories')}</Col>
        <Col xs={24} lg={12}>{column('income', 'Income categories')}</Col>
      </Row>
      <CategoryModal open={editing !== null} category={editing} onClose={() => setEditing(null)} />
    </>
  );
}

function CategoryModal({ open, category, onClose }) {
  const { message } = App.useApp();
  const save = useSaveCategory();
  const [form] = Form.useForm();
  const icon = Form.useWatch('icon', form) ?? 'tag';
  const color = Form.useWatch('color', form) ?? COLOR_PRESETS[0];
  const isEdit = Boolean(category?._id);

  async function submit() {
    const values = await form.validateFields();
    const hex = typeof values.color === 'string' ? values.color : values.color.toHexString();
    try {
      await save.mutateAsync({ id: category?._id, ...values, color: hex });
      message.success(isEdit ? 'Category updated' : 'Category added');
      onClose();
    } catch (e) {
      message.error(errorMessage(e));
    }
  }

  const colorHex = typeof color === 'string' ? color : color.toHexString();

  return (
    <Modal
      title={isEdit ? `Edit ${category.name}` : 'Add category'}
      open={open}
      onCancel={onClose}
      onOk={submit}
      okText="Save"
      confirmLoading={save.isPending}
      destroyOnHidden
      afterOpenChange={(o) =>
        o && form.setFieldsValue({ name: category?.name, type: category?.type ?? 'expense', color: category?.color ?? COLOR_PRESETS[0], icon: category?.icon ?? 'tag' })
      }
    >
      <Form form={form} layout="vertical" requiredMark={false}>
        <div className="cat-preview">
          <CategoryIcon icon={icon} color={colorHex} size={48} />
        </div>
        <Form.Item name="type" hidden={isEdit}>
          <Segmented block options={[{ label: 'Expense', value: 'expense' }, { label: 'Income', value: 'income' }]} />
        </Form.Item>
        <Form.Item name="name" label="Name" rules={[{ required: true, whitespace: true, message: 'Enter a name.' }]}>
          <Input maxLength={30} placeholder="e.g. Pets, Gym, Side hustle" />
        </Form.Item>
        <Form.Item name="color" label="Color">
          <ColorPicker presets={[{ label: 'Suggested', colors: COLOR_PRESETS }]} disabledAlpha showText />
        </Form.Item>
        <Form.Item name="icon" hidden>
          <Input />
        </Form.Item>
        <Form.Item label="Icon">
          <div className="icon-grid" role="radiogroup" aria-label="Icon">
            {Object.keys(ICONS).map((key) => (
              <button
                key={key}
                type="button"
                role="radio"
                aria-checked={icon === key}
                aria-label={key}
                className={`icon-choice ${icon === key ? 'on' : ''}`}
                onClick={() => form.setFieldValue('icon', key)}
              >
                <CategoryIcon icon={key} color={icon === key ? colorHex : '#94a3b8'} size={32} />
              </button>
            ))}
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
}
