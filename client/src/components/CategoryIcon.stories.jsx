import CategoryIcon, { COLOR_PRESETS, ICONS } from './CategoryIcon';

export default {
  title: 'Data display/CategoryIcon',
  component: CategoryIcon,
  argTypes: {
    icon: { control: 'select', options: Object.keys(ICONS) },
    color: { control: 'color' },
    size: { control: { type: 'range', min: 20, max: 80, step: 2 } },
  },
  args: { icon: 'shopping-cart', color: '#22c55e', size: 34 },
};

export const Default = {};

export const Large = { args: { icon: 'home', color: '#6366f1', size: 64 } };

/** Unknown icon names fall back to a tag icon instead of breaking. */
export const UnknownIcon = { args: { icon: 'does-not-exist', color: '#64748b' } };

/** Every icon a user can pick for a category, in the preset colors. */
export const AllIcons = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(96px, 1fr))', gap: 16 }}>
      {Object.keys(ICONS).map((name, i) => (
        <div key={name} style={{ display: 'grid', justifyItems: 'center', gap: 6, fontSize: 12 }}>
          <CategoryIcon icon={name} color={COLOR_PRESETS[i % COLOR_PRESETS.length]} size={40} />
          <code>{name}</code>
        </div>
      ))}
    </div>
  ),
};
