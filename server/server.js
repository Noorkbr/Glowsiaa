require('dotenv').config();

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const mongoose = require('mongoose');
const path = require('path');

const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const adminRoutes = require('./routes/admin');
const bannerRoutes = require('./routes/banners');
const tipRoutes = require('./routes/tips');
const settingRoutes = require('./routes/settings');
const couponRoutes = require('./routes/coupons');
const paymentRoutes = require('./routes/payments');
const categoryRoutes = require('./routes/categories');
const uploadRoutes = require('./routes/uploads');

const app = express();
const PORT = process.env.PORT || 5000;

mongoose.set('sanitizeFilter', true);

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim())
  : ['http://localhost:5173', 'http://localhost:5174'];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/health', (req, res) => {
  res.json({ success: true, message: 'Glowsiaa API is running', timestamp: new Date() });
});

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/banners', bannerRoutes);
app.use('/api/tips', tipRoutes);
app.use('/api/settings', settingRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/uploads', uploadRoutes);

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

app.use((err, req, res, next) => {
  console.error(err);
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: Object.values(err.errors).map((e) => e.message),
    });
  }
  if (err.name === 'CastError') {
    return res.status(400).json({ success: false, message: 'Invalid resource identifier' });
  }
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0] || 'field';
    return res.status(409).json({ success: false, message: `${field} already exists` });
  }
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ success: false, message: 'File too large (max 5MB)' });
  }
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal server error',
  });
});

const startServer = async () => {
  try {
    if (!process.env.MONGO_URI) throw new Error('MONGO_URI is not defined');

    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected');
    mongoose.connection.on('error', (e) => console.error('MongoDB error:', e.message));

    const server = app.listen(PORT, () =>
      console.log(`🚀 Glowsiaa server on port ${PORT}`)
    );

    // Handle port-already-in-use gracefully
    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} is already in use. Kill the old process first:`);
        console.error(`   npx kill-port ${PORT}   OR   taskkill /F /PID <pid>`);
        process.exit(1);
      } else {
        throw err;
      }
    });

    // Graceful shutdown (Ctrl+C, nodemon restarts, Docker SIGTERM)
    const shutdown = (signal) => {
      console.log(`\n⚡ ${signal} received. Closing server…`);
      server.close(async () => {
        await mongoose.connection.close();
        console.log('✅ Server closed cleanly.');
        process.exit(0);
      });
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
    // nodemon uses SIGUSR2 on restart
    process.once('SIGUSR2', () => {
      server.close(() => process.kill(process.pid, 'SIGUSR2'));
    });

  } catch (error) {
    console.error('❌ Failed to start:', error.message);
    process.exit(1);
  }
};

// Only start when run directly — NOT when require()'d by tests or syntax checkers
if (require.main === module) {
  startServer();
}

module.exports = app;