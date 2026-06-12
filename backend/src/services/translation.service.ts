import dotenv from 'dotenv';
import { SupabaseClient } from '@supabase/supabase-js';

dotenv.config();
const MYMEMORY_EMAIL = process.env.MYMEMORY_EMAIL || '';

const TARGET_LANGS = ['en', 'ko', 'zh'];

/**
 * Dịch một đoạn text từ tiếng Việt sang ngôn ngữ đích qua MyMemory API (miễn phí).
 * Tự động chunk text dài thành nhiều đoạn ≤ 500 ký tự để tránh giới hạn API.
 */
export const translateText = async (text: string, targetLang: string): Promise<string> => {
  if (!text?.trim()) return text;

  // MyMemory giới hạn 500 ký tự/request — chunk nếu dài hơn
  const chunks = chunkText(text, 480);
  const translated: string[] = [];

  for (const chunk of chunks) {
    try {
      const langpair = `vi|${targetLang}`;
      let url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(chunk)}&langpair=${langpair}`;
      if (MYMEMORY_EMAIL) url += `&de=${MYMEMORY_EMAIL}`;

      const response = await fetch(url);
      const data = await response.json();

      if (data?.responseData?.translatedText) {
        translated.push(data.responseData.translatedText);
      } else {
        translated.push(chunk); // fallback giữ nguyên chunk
      }
    } catch {
      translated.push(chunk);
    }
  }

  return translated.join(' ');
};

/**
 * Tự động dịch toàn bộ fields sang 3 ngôn ngữ (en, ko, zh) và upsert vào bảng translations.
 * Chạy dưới dạng background task (không block response).
 *
 * @param entityType  - 'property' | 'project' | 'blog'
 * @param entityId    - UUID của entity
 * @param fields      - Object các field cần dịch: { title, description, ... }
 * @param supabase    - Supabase client instance
 */
export const autoTranslateAllLangs = async (
  entityType: string,
  entityId: string,
  fields: Record<string, string | null | undefined>,
  supabase: SupabaseClient
): Promise<void> => {
  for (const lang of TARGET_LANGS) {
    try {
      const translatedFields: Record<string, string> = {};

      for (const [key, value] of Object.entries(fields)) {
        translatedFields[key] = value ? await translateText(value, lang) : '';
      }

      // Upsert — cập nhật nếu đã có, tạo mới nếu chưa có
      await supabase.from('translations').upsert(
        {
          entity_type: entityType,
          entity_id: entityId,
          lang_code: lang,
          translation_data: translatedFields,
          is_approved: false
        },
        { onConflict: 'entity_type,entity_id,lang_code' }
      );

      console.log(`[AutoTranslate] ✓ ${entityType}/${entityId} → ${lang}`);
    } catch (err) {
      console.error(`[AutoTranslate] ✗ ${entityType}/${entityId} → ${lang}:`, err);
    }
  }
};

/**
 * Dịch các content_blocks của blog (chỉ block type text/heading, bỏ qua image/video).
 */
export const translateContentBlocks = async (
  blocks: Array<{ type: string; value: string }>,
  targetLang: string
): Promise<Array<{ type: string; value: string }>> => {
  return Promise.all(
    blocks.map(async (block) => {
      if (block.type === 'text' || block.type === 'heading') {
        return { ...block, value: await translateText(block.value, targetLang) };
      }
      return block; // image / video — giữ nguyên
    })
  );
};

/**
 * Tự động dịch blog (title + content_blocks) sang 3 ngôn ngữ.
 */
export const autoTranslateBlog = async (
  blogId: string,
  title: string,
  contentBlocks: Array<{ type: string; value: string }>,
  supabase: SupabaseClient
): Promise<void> => {
  for (const lang of TARGET_LANGS) {
    try {
      const translatedTitle = await translateText(title, lang);
      const translatedBlocks = await translateContentBlocks(contentBlocks || [], lang);

      await supabase.from('translations').upsert(
        {
          entity_type: 'blog',
          entity_id: blogId,
          lang_code: lang,
          translation_data: { title: translatedTitle, content_blocks: translatedBlocks },
          is_approved: false
        },
        { onConflict: 'entity_type,entity_id,lang_code' }
      );

      console.log(`[AutoTranslate] ✓ blog/${blogId} → ${lang}`);
    } catch (err) {
      console.error(`[AutoTranslate] ✗ blog/${blogId} → ${lang}:`, err);
    }
  }
};

// ── Helpers ──────────────────────────────────────────────────────────────

function chunkText(text: string, maxLen: number): string[] {
  const chunks: string[] = [];
  let start = 0;
  while (start < text.length) {
    let end = start + maxLen;
    // Ưu tiên cắt tại dấu cách gần nhất để không cắt giữa từ
    if (end < text.length) {
      const spaceIdx = text.lastIndexOf(' ', end);
      if (spaceIdx > start) end = spaceIdx;
    }
    chunks.push(text.slice(start, end).trim());
    start = end + 1;
  }
  return chunks.filter(Boolean);
}
