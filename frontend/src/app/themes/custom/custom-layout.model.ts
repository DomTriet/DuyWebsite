// ============================================================
// Mô hình dữ liệu dùng chung cho Custom Theme & Theme Builder
// ============================================================

export interface ThemeTokens {
  colorPrimary: string;
  colorBg: string;
  colorText: string;
  colorAccent: string;
  fontHead: string;
  fontBody: string;
  logoUrl: string;
  logoText: string;
}

export type BlockType = 'hero' | 'stats' | 'properties' | 'sections' | 'blogs' | 'gallery' | 'text' | 'cta';

export interface LayoutBlock {
  id: string;
  type: BlockType;
  visible: boolean;
  props: any;
}

export interface FooterConfig {
  text: string;
  showContact: boolean;
  phone: string;
  email: string;
}

export interface LayoutConfig {
  tokens: ThemeTokens;
  blocks: LayoutBlock[];
  footer: FooterConfig;
  basePropertyTheme: string;
}

// Danh sách font đã được nạp sẵn trong index.html
export const FONT_OPTIONS = [
  'Be Vietnam Pro', 'Cormorant Garamond',
  'Space Grotesk', 'Inter', 'Lora', 'DM Sans',
  'Playfair Display', 'Quicksand'
];

// Palette các block có thể thêm trong builder
export const BLOCK_PALETTE: { type: BlockType; label: string; icon: string }[] = [
  { type: 'hero',       label: 'Hero (Banner đầu trang)', icon: '🖼️' },
  { type: 'stats',      label: 'Thống kê (Con số)',       icon: '📊' },
  { type: 'properties', label: 'Danh sách Bất động sản',  icon: '🏠' },
  { type: 'sections',   label: 'Nội dung dự án',          icon: '📑' },
  { type: 'blogs',      label: 'Tin tức dự án',           icon: '📰' },
  { type: 'gallery',    label: 'Thư viện ảnh',            icon: '🌄' },
  { type: 'text',       label: 'Đoạn văn bản',           icon: '📝' },
  { type: 'cta',        label: 'Kêu gọi hành động (CTA)', icon: '📣' },
];

export function blockLabel(type: BlockType): string {
  return BLOCK_PALETTE.find(b => b.type === type)?.label || type;
}

let _seq = 0;
export function makeId(): string {
  _seq += 1;
  return `blk-${Date.now().toString(36)}-${_seq}`;
}

// Tạo block mới với props mặc định theo loại
export function defaultBlock(type: BlockType): LayoutBlock {
  const base: LayoutBlock = { id: makeId(), type, visible: true, props: {} };
  switch (type) {
    case 'hero':
      base.props = {
        image: 'https://images.unsplash.com/photo-1600210492493-0946911123ea?auto=format&fit=crop&w=1600&q=85',
        title: '', subtitle: '', ctaText: 'Khám phá ngay', ctaLink: '#listing'
      };
      break;
    case 'stats':
      base.props = { items: [{ value: '24/7', label: 'Hỗ trợ' }, { value: 'A+', label: 'Thiết kế' }] };
      break;
    case 'properties': base.props = { title: 'Danh sách Bất động sản', showFilter: true }; break;
    case 'sections':   base.props = { title: 'Thông tin dự án' }; break;
    case 'blogs':      base.props = { title: 'Tin tức dự án' }; break;
    case 'gallery':    base.props = { title: 'Thư viện', images: [] }; break;
    case 'text':       base.props = { heading: 'Tiêu đề', body: 'Nhập nội dung...' }; break;
    case 'cta':        base.props = { title: 'Quan tâm tới dự án?', buttonText: 'Liên hệ ngay', buttonLink: '/contact' }; break;
  }
  return base;
}

// Cấu hình mặc định khi dự án chưa có layout_config
export function defaultLayout(): LayoutConfig {
  return {
    tokens: {
      colorPrimary: '#0052CC',
      colorBg: '#FFFFFF',
      colorText: '#0F0F0F',
      colorAccent: '#0052CC',
      fontHead: 'Cormorant Garamond',
      fontBody: 'Be Vietnam Pro',
      logoUrl: '',
      logoText: ''
    },
    blocks: [
      defaultBlock('hero'),
      defaultBlock('stats'),
      defaultBlock('properties'),
      defaultBlock('sections'),
      defaultBlock('blogs'),
    ],
    footer: { text: '', showContact: true, phone: '', email: '' },
    basePropertyTheme: 'minimalist'
  };
}

// ── Preset token mặc định cho từng theme (tái hiện đúng màu/font hiện tại) ──
export const THEME_TOKEN_PRESETS: Record<string, ThemeTokens> = {
  minimalist:  { colorPrimary: '#0052CC', colorBg: '#FFFFFF', colorText: '#0F0F0F', colorAccent: '#0052CC', fontHead: 'Cormorant Garamond', fontBody: 'Be Vietnam Pro', logoUrl: '', logoText: '' },
  luxury:      { colorPrimary: '#C9A84C', colorBg: '#0A0A0A', colorText: '#EDE8DF', colorAccent: '#C9A84C', fontHead: 'Cormorant Garamond', fontBody: 'Be Vietnam Pro', logoUrl: '', logoText: '' },
  'eco-green': { colorPrimary: '#2D6A4F', colorBg: '#FAF8F3', colorText: '#1B4332', colorAccent: '#52B788', fontHead: 'Cormorant Garamond', fontBody: 'Be Vietnam Pro', logoUrl: '', logoText: '' },
  custom:      { colorPrimary: '#0052CC', colorBg: '#FFFFFF', colorText: '#0F0F0F', colorAccent: '#0052CC', fontHead: 'Cormorant Garamond', fontBody: 'Be Vietnam Pro', logoUrl: '', logoText: '' },
};

/**
 * Layout mặc định theo theme. Blocks dùng props RỖNG để mỗi theme tự fallback về
 * giao diện gốc (ảnh hero, stats, tiêu đề... mặc định của theme) → dự án chưa tùy biến trông y hệt hiện tại.
 */
export function defaultLayoutFor(themeId: string): LayoutConfig {
  const tokens = { ...(THEME_TOKEN_PRESETS[themeId] || THEME_TOKEN_PRESETS['custom']) };
  return {
    tokens,
    blocks: [
      { id: makeId(), type: 'hero',       visible: true, props: {} },
      { id: makeId(), type: 'stats',      visible: true, props: {} },
      { id: makeId(), type: 'properties', visible: true, props: { showFilter: true } },
      { id: makeId(), type: 'sections',   visible: true, props: {} },
      { id: makeId(), type: 'blogs',      visible: true, props: {} },
    ],
    footer: { text: '', showContact: true, phone: '', email: '' },
    basePropertyTheme: themeId === 'custom' ? 'minimalist' : themeId,
  };
}

/** Chuẩn hóa config từ DB cho 1 theme cụ thể (base = preset của theme đó). */
export function normalizeLayoutFor(raw: any, themeId: string): LayoutConfig {
  const def = defaultLayoutFor(themeId);
  if (!raw || typeof raw !== 'object' || !Array.isArray(raw.blocks) || raw.blocks.length === 0) {
    return def;
  }
  return {
    tokens: { ...def.tokens, ...(raw.tokens || {}) },
    blocks: raw.blocks.map((b: any) => ({
      id: b.id || makeId(),
      type: b.type,
      visible: b.visible !== false,
      props: b.props || {}
    })),
    footer: { ...def.footer, ...(raw.footer || {}) },
    basePropertyTheme: raw.basePropertyTheme || def.basePropertyTheme,
  };
}

// Chuẩn hóa config từ DB (điền khuyết thiếu) — đảm bảo render an toàn
export function normalizeLayout(raw: any): LayoutConfig {
  const def = defaultLayout();
  if (!raw || typeof raw !== 'object' || !Array.isArray(raw.blocks) || raw.blocks.length === 0) {
    return def;
  }
  return {
    tokens: { ...def.tokens, ...(raw.tokens || {}) },
    blocks: raw.blocks.map((b: any) => ({
      id: b.id || makeId(),
      type: b.type,
      visible: b.visible !== false,
      props: b.props || {}
    })),
    footer: { ...def.footer, ...(raw.footer || {}) },
    basePropertyTheme: raw.basePropertyTheme || 'minimalist'
  };
}
