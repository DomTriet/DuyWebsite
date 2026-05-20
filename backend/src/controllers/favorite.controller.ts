import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase';

export const toggleFavorite = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { property_id } = req.body;
    const user_id = req.user?.id;

    const { data: existing, error: fetchError } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', user_id)
      .eq('property_id', property_id)
      .maybeSingle();

    if (fetchError) throw fetchError;

    if (existing) {
      await supabase.from('favorites').delete().eq('id', existing.id);
      res.status(200).json({ status: 'success', message: 'Đã bỏ yêu thích', data: { is_favorite: false } });
    } else {
      await supabase.from('favorites').insert([{ user_id, property_id }]);
      res.status(200).json({ status: 'success', message: 'Đã lưu vào danh sách yêu thích', data: { is_favorite: true } });
    }
  } catch (error) { next(error); }
};

export const getMyFavorites = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { data, error } = await supabase
      .from('favorites')
      .select('id, property_id, properties!inner(*, property_media(*))')
      .eq('user_id', req.user?.id)
      .eq('properties.is_deleted', false)
      .order('created_at', { ascending: false });
    if (error) throw error;
    res.status(200).json({ status: 'success', data });
  } catch (error) { next(error); }
};

export const getMyFavoriteIds = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { data, error } = await supabase.from('favorites').select('property_id').eq('user_id', req.user?.id);
    if (error) throw error;
    // Trả về một mảng ID dạng [uuid1, uuid2] để Angular dễ parse
    res.status(200).json({ status: 'success', data: data.map(d => d.property_id) });
  } catch (error) { next(error); }
};