const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Image = require('../models/imageSchema');

const router = express.Router();

// ----------------------------
// Ensure Upload Folder Exists
// ----------------------------
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// ----------------------------
// Multer Configuration
// ----------------------------
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const cleanName = file.originalname.replace(/\s+/g, '_');
    cb(null, Date.now() + '-' + cleanName);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
  fileFilter: function (req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    const mime = file.mimetype;
    const allowedExts = ['.jpg', '.jpeg', '.png'];
    const allowedMimes = ['image/jpeg', 'image/png'];
    if (allowedExts.includes(ext) && allowedMimes.includes(mime)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPG, JPEG, PNG files are allowed'));
    }
  }
});

// ----------------------------
// POST: Upload Image (Admin)
// ----------------------------
router.post('/upload', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const { title, date } = req.body;

    if (!title || !date) {
      return res.status(400).json({ error: 'Title and date are required' });
    }

    const image = new Image({
      url: `/uploads/${req.file.filename}`,
      title: title.trim(),
      date: new Date(date),
      uploadedBy: req.user?.email || 'admin'
    });

    await image.save();
    res.status(201).json({ success: true, image });
  } catch (err) {
    console.error('Upload error:', err.message);
    res.status(500).json({ error: 'Server error during upload' });
  }
});

// ----------------------------
// GET: Fetch All Images (Public)
// ----------------------------
router.get('/', async (req, res) => {
  try {
    const images = await Image.find().sort({ date: -1 });
    res.json(images);
  } catch (err) {
    console.error('Fetch error:', err.message);
    res.status(500).json({ error: 'Server error while fetching images' });
  }
});

module.exports = router;
