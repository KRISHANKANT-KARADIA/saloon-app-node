import multer from 'multer';
import path from 'path';
import fs from 'fs';

const TEAM_MEMBER_UPLOAD_DIR = 'uploads/teamMembers/';


if (!fs.existsSync(TEAM_MEMBER_UPLOAD_DIR)) {
  fs.mkdirSync(TEAM_MEMBER_UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, TEAM_MEMBER_UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename = `${Date.now()}-${file.fieldname}${ext}`;
    cb(null, filename);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files allowed'), false);
  }
};

export const uploadTeamMemberProfile = multer({
  storage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 }
});
