const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { protect, adminOnly } = require('../middleware/auth');
const { createRateLimit } = require('../middleware/rateLimit');

const router = express.Router();
const rl = createRateLimit({ windowMs: 15 * 60 * 1000, max: 60, message: 'Too many upload requests' });

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

// Multer configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const basename = path.basename(file.originalname, ext)
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .slice(0, 30);
    const unique = `${basename}-${Date.now()}${ext}`;
    cb(null, unique);
  },
});

const allowedTypes = /\.(jpg|jpeg|png|gif|webp|svg)$/i;

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (!allowedTypes.test(path.extname(file.originalname))) {
      return cb(new Error('Only image files are allowed (jpg, png, gif, webp, svg)'));
    }
    cb(null, true);
  },
});

// POST /api/uploads/image — single image upload (admin only)
router.post('/image', rl, protect, adminOnly, upload.single('image'), (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image file provided' });
    }

    const baseURL = process.env.SERVER_URL || `http://localhost:${process.env.PORT || 5000}`;
    const url = `${baseURL}/uploads/${req.file.filename}`;

    res.json({
      success: true,
      url,
      filename: req.file.filename,
      size: req.file.size,
      mimetype: req.file.mimetype,
    });
  } catch (e) { next(e); }
});

// DELETE /api/uploads/:filename — delete an uploaded file (admin only)
router.delete('/:filename', rl, protect, adminOnly, (req, res, next) => {
  try {
    const filename = path.basename(req.params.filename); // sanitize
    const filePath = path.join(uploadsDir, filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: 'File not found' });
    }

    fs.unlinkSync(filePath);
    res.json({ success: true, message: 'File deleted' });
  } catch (e) { next(e); }
});

// GET /api/uploads/list — list all uploaded files (admin only)
router.get('/list', rl, protect, adminOnly, (req, res, next) => {
  try {
    const files = fs.readdirSync(uploadsDir)
      .filter(f => allowedTypes.test(path.extname(f)))
      .map(f => {
        const stats = fs.statSync(path.join(uploadsDir, f));
        const baseURL = process.env.SERVER_URL || `http://localhost:${process.env.PORT || 5000}`;
        return {
          filename: f,
          url: `${baseURL}/uploads/${f}`,
          size: stats.size,
          createdAt: stats.birthtime,
        };
      })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({ success: true, files, count: files.length });
  } catch (e) { next(e); }
});

module.exports = router;

