const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const connection = require('./db');

// Import routes
const userRoute = require('./routes/userRoute');
const newsRoute = require('./routes/newsRoute');
const jobRoute = require('./routes/jobRoute');
const pollRoute = require('./routes/pollRoute');
const alumniRoute = require('./routes/alumniRoute');
const imageRoute = require('./routes/imageRoute');

// Initialize express app
const app = express();

// ==============================
// ✅ CORS Configuration
// ==============================
const allowedOrigins = [
  process.env.FRONTENDURI,
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:8080',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:8080',
  'https://acpcealumni.netlify.app' // ✅ Netlify domain
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true
}));

// ✅ Handle Preflight OPTIONS request globally
app.options('*', cors());

// ==============================
// ✅ JSON Parser Middleware
// ==============================
app.use(express.json());

// ==============================
// ✅ Static Files Setup
// ==============================
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ==============================
// ✅ API Routes
// ==============================
app.use('/user', userRoute);
app.use('/news', newsRoute);
app.use('/job', jobRoute);
app.use('/poll', pollRoute);
app.use('/alumni', alumniRoute);
app.use('/api/images', imageRoute);

// ==============================
// ✅ Global Error Handler
// ==============================
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(500).json({ error: 'Internal Server Error' });
});

// ==============================
// ✅ DB Connection
// ==============================
connection();

// ==============================
// ✅ Test Route
// ==============================
app.get('/', (req, res) => {
  res.send("✅ Server is running successfully");
});

// ==============================
// ✅ Server Listener
// ==============================
const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});
