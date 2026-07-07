import cloudinary from '../config/cloudinary';

/**
 * Upload ảnh/video lên Cloudinary
 * @param filePath Đường dẫn file cục bộ (sau khi multer lưu tạm)
 */
export const uploadMedia = async (filePath: string): Promise<string> => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: 'bdsdiemtam/properties',
    });
    return result.secure_url;
  } catch (error) {
    console.error('[Upload Service] Error uploading to Cloudinary:', error);
    throw new Error('Failed to upload media');
  }
};