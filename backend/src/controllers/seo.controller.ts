import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase';

export const getSitemap = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { data: properties } = await supabase.from('properties').select('slug').eq('is_deleted', false);
    const baseUrl = process.env.FRONTEND_URL || 'https://bdsdiemtam.com';

    let urls = `<url><loc>${baseUrl}/</loc></url>\n`;
    urls += `<url><loc>${baseUrl}/properties</loc></url>\n`;

    if (properties) {
      properties.forEach(p => {
        urls += `<url><loc>${baseUrl}/properties/${p.slug}</loc></url>\n`;
      });
    }

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="https://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}</urlset>`;
    
    res.header('Content-Type', 'application/xml');
    res.status(200).send(sitemap);
  } catch (error) {
    next(error);
  }
};