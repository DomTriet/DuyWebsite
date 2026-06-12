import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase';

export const getBanners = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { data, error } = await supabase
      .from('homepage_banners')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error) throw error;
    res.status(200).json({ status: 'success', data });
  } catch (error) {
    next(error);
  }
};

export const getAllBanners = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { data, error } = await supabase
      .from('homepage_banners')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) throw error;
    res.status(200).json({ status: 'success', data });
  } catch (error) {
    next(error);
  }
};

export const createBanner = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { title, subtitle, image_url, cta_text, cta_link, sort_order, is_active } = req.body;

    if (!image_url) {
      res.status(400).json({ status: 'error', message: 'image_url là bắt buộc.' });
      return;
    }

    const { data, error } = await supabase
      .from('homepage_banners')
      .insert({ title, subtitle, image_url, cta_text, cta_link, sort_order: sort_order ?? 0, is_active: is_active ?? true })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ status: 'success', data });
  } catch (error) {
    next(error);
  }
};

export const updateBanner = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const { data, error } = await supabase
      .from('homepage_banners')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.status(200).json({ status: 'success', data });
  } catch (error) {
    next(error);
  }
};

export const deleteBanner = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('homepage_banners').delete().eq('id', id);
    if (error) throw error;
    res.status(200).json({ status: 'success', message: 'Banner đã được xoá.' });
  } catch (error) {
    next(error);
  }
};
