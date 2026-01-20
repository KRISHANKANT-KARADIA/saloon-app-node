import multer from 'multer';
import path from 'path';
import fs from 'fs';

const serviceUploadDir = 'uploads/services';

if (!fs.existsSync(serviceUploadDir)) {
  fs.mkdirSync(serviceUploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, serviceUploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename = `${Date.now()}${ext}`;
    cb(null, filename);
  }
});

export const uploadServiceLogo = multer({ storage });
