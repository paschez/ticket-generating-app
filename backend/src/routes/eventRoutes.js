import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { protect, adminOnly } from '../middleware/authMiddleware.js';
import { getEvents, getEventById, createEvent, updateEvent, deleteEvent, getDashboardStats } from '../controllers/eventController.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`;
    cb(null, uniqueName);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

const upload = multer({ storage, fileFilter });

router.get('/', getEvents);
router.get('/dashboard', protect, adminOnly, getDashboardStats);
router.get('/:id', getEventById);
router.post('/', protect, adminOnly, upload.single('banner'), createEvent);
router.patch('/:id', protect, adminOnly, upload.single('banner'), updateEvent);
router.delete('/:id', protect, adminOnly, deleteEvent);

export default router;
