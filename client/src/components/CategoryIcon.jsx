import {
  BankOutlined,
  BookOutlined,
  CarOutlined,
  CoffeeOutlined,
  CreditCardOutlined,
  DollarOutlined,
  GiftOutlined,
  GlobalOutlined,
  HeartOutlined,
  HomeOutlined,
  LaptopOutlined,
  MedicineBoxOutlined,
  MobileOutlined,
  PlayCircleOutlined,
  RiseOutlined,
  RocketOutlined,
  ShoppingCartOutlined,
  ShoppingOutlined,
  SkinOutlined,
  SmileOutlined,
  SyncOutlined,
  TagOutlined,
  ThunderboltOutlined,
  TrophyOutlined,
  WifiOutlined,
} from '@ant-design/icons';

export const ICONS = {
  coffee: CoffeeOutlined,
  'shopping-cart': ShoppingCartOutlined,
  home: HomeOutlined,
  car: CarOutlined,
  thunderbolt: ThunderboltOutlined,
  shopping: ShoppingOutlined,
  'medicine-box': MedicineBoxOutlined,
  'play-circle': PlayCircleOutlined,
  global: GlobalOutlined,
  book: BookOutlined,
  sync: SyncOutlined,
  tag: TagOutlined,
  bank: BankOutlined,
  laptop: LaptopOutlined,
  rise: RiseOutlined,
  gift: GiftOutlined,
  heart: HeartOutlined,
  mobile: MobileOutlined,
  wifi: WifiOutlined,
  skin: SkinOutlined,
  trophy: TrophyOutlined,
  dollar: DollarOutlined,
  'credit-card': CreditCardOutlined,
  rocket: RocketOutlined,
  smile: SmileOutlined,
};

export const COLOR_PRESETS = [
  '#f97316', '#22c55e', '#6366f1', '#0ea5e9', '#eab308', '#ec4899', '#ef4444',
  '#a855f7', '#14b8a6', '#3b82f6', '#8b5cf6', '#16a34a', '#db2777', '#64748b',
];

/** A round, tinted badge with the category's icon. */
export default function CategoryIcon({ icon, color = '#64748b', size = 34 }) {
  const Icon = ICONS[icon] ?? TagOutlined;
  return (
    <span
      className="cat-icon"
      style={{ width: size, height: size, color, background: `${color}1f`, fontSize: size * 0.48 }}
      aria-hidden="true"
    >
      <Icon />
    </span>
  );
}
