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

// Parse allowed origins — trim each entry and ignore leading/trailing spaces
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim()).filter(Boolean)
  : [];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, server-to-server)
    if (!origin) return callback(null, true);
    // If no ALLOWED_ORIGINS configured, allow everything (dev / first deploy)
    if (allowedOrigins.length === 0) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
}));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Root route — useful health check when visiting the Railway URL directly
app.get('/', (req, res) => {
  res.json({
    success: true,
    name: 'Glowsiaa API',
    version: '1.0.0',
    status: 'running',
    timestamp: new Date(),
    endpoints: '/health  |  /api/products  |  /api/orders  |  /api/auth  |  /api/settings/public',
  });
});

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
    if (!process.env.MONGO_URI) throw new Error('MONGO_URI is not defined in environment variables');

    // Sanitize: strip any stray whitespace / Windows CR that .env editors may add
    const rawUri = process.env.MONGO_URI.trim().replace(/\r/g, '');

    // Ensure database name "glowsiaa" is in the URI path (required for proper auth scope)
    const uri = rawUri.includes('/glowsiaa?') || rawUri.includes('/glowsiaa&')
      ? rawUri
      : rawUri.replace(/\/(\?|$)/, '/glowsiaa$1');

    // Mask credentials in logs for security
    const maskedUri = uri.replace(/:\/\/([^:]+):([^@]+)@/, '://<user>:****@');
    console.log(`🔗 Connecting to MongoDB: ${maskedUri}`);

    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      family: 4, // force IPv4 — avoids IPv6 DNS issues on some hosts
    });
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
    if (error.message.includes('bad auth') || error.message.includes('authentication failed')) {
      console.error('   ↳ MongoDB authentication failed. Check your MONGO_URI:');
      console.error('     1. Username & password are correct in Railway Variables');
      console.error('     2. Password special chars are URL-encoded (@ → %40, # → %23, ! → %21)');
      console.error('     3. MongoDB Atlas Network Access allows 0.0.0.0/0 (all IPs)');
      console.error('     4. The DB user has readWrite role on the "glowsiaa" database');
    }
    process.exit(1);
  }
};

// Only start when run directly — NOT when require()'d by tests or syntax checkers
if (require.main === module) {
  startServer();
}

module.exports = app;