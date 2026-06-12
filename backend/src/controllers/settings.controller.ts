import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase';

export const getSettings = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { data, error } = await supabase
      .from('system_settings')
      .select('key, value');

    if (error) throw error;

    const settings: Record<string, any> = {};
    (data || []).forEach((row: any) => { settings[row.key] = row.value; });

    res.status(200).json({ status: 'success', data: settings });
  } catch (error) {
    next(error);
  }
};

export const updateSetting = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { key } = req.params;
    const { value } = req.body;

    if (value === undefined) {
      res.status(400).json({ status: 'error', message: 'value là bắt buộc.' });
      return;
    }

    const { data, error } = await supabase
      .from('system_settings')
      .upsert({ key, value }, { onConflict: 'key' })
      .select()
      .single();

    if (error) throw error;
    res.status(200).json({ status: 'success', data });
  } catch (error) {
    next(error);
  }
};
