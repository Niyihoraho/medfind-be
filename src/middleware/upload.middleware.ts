// ─── UPLOAD MIDDLEWARE ─────────────────────────────────────────────
// Handles multipart/form-data for image uploads using Multer and Cloudinary.

import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

// Configure Cloudinary (it will automatically use CLOUDINARY_URL from process.env)
cloudinary.config();

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (_req, file) => {
    return {
      folder: 'medfind',
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
      public_id: file.fieldname + '-' + Date.now() + '-' + Math.round(Math.random() * 1e9),
    };
  },
});

const fileFilter = (_req: any, file: any, cb: any) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only images are allowed!'), false);
  }
};

export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});
