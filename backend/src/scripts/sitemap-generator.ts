import { supabase } from '../config/supabase';
import fs from 'fs';
import path from 'path';

/**
 * Hàm tự động sinh file sitemap.xml phục vụ cho SEO Google
 */
export const generateSitemap = async (): Promise<void> => {
  try {
    const { data: properties } = await supabase.from('properties').select('slug').eq('is_deleted', false);
    
    let urls = `<url><loc>https://pro-realestate.com/</loc></url>\n`;
    urls += `<url><loc>https://pro-realestate.com/properties</loc></url>\n`;
    
    if (properties) {
      properties.forEach(p => {
        urls += `<url><loc>https://pro-realestate.com/properties/${p.slug}</loc></url>\n`;
      });
    }

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="https://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}</urlset>`;
    
    // Lưu file sitemap vào thư mục frontend/src/assets (Hoặc public tùy cấu trúc Frontend sau này)
    fs.writeFileSync(path.join(__dirname, '../../sitemap.xml'), sitemap);
    console.log('✅ [SEO] Sitemap.xml updated successfully');
  } catch (error) {
    console.error('❌ [SEO Error]', error);
  }
};