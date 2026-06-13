import { supabase } from '../config/supabase';

/**
 * Chuyển đổi chuỗi Tiếng Việt có dấu thành slug không dấu cho URL
 */
export const generateSlug = (text: string): string => {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'd')
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+|-+$/g, '');
};

/**
 * Tạo slug duy nhất: thử base → base-2 → base-3 ... cho đến khi không trùng trong DB.
 * excludeId: bỏ qua record hiện tại khi update (tránh conflict với chính nó).
 */
export const makeUniqueSlug = async (
  table: string,
  base: string,
  excludeId?: string
): Promise<string> => {
  let candidate = base;
  let counter = 2;
  while (true) {
    let query = supabase.from(table).select('id').eq('slug', candidate);
    if (excludeId) query = query.neq('id', excludeId);
    const { data } = await query.maybeSingle();
    if (!data) return candidate;
    candidate = `${base}-${counter}`;
    counter++;
  }
};
