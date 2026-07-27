require('dotenv').config();

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const mongoose = require('mongoose');

const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 5000;

mongoose.set('sanitizeFilter', true);

// CORS — in production set ALLOWED_ORIGINS in your .env
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim())
  : ['http://localhost:5173', 'http://localhost:5174'];

app.use(
  cors({
    origin: (origin, callback) => {
      // allow requests with no origin (curl, Postman, same-origin SSR)
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

app.get('/health', (req, res) => {
  res.json({ success: true, message: 'Glowsiaa API is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

app.use((err, req, res, next) => {
  console.error(err);

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: Object.values(err.errors).map((error) => error.message),
    });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'Invalid resource identifier',
    });
  }

  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal server error',
  });
});

const startServer = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI is not defined in environment variables');
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected successfully');

    mongoose.connection.on('error', (error) => {
      console.error('MongoDB connection error:', error.message);
    });

    app.listen(PORT, () => {
      console.log(`Glowsiaa server listening on port ${PORT}`);
    });
  } catch (error) {
    if (error.message.includes('authentication failed')) {
      console.error('--------------------------------------------------');
      console.error('DATABASE AUTHENTICATION FAILED');
      console.error('--------------------------------------------------');
      console.error('This is an issue with the credentials in your .env file.');
      console.error('Please check the following:');
      console.error('1. File Location: Make sure you have a .env file in the `server/` directory.');
      console.error('2. Credentials: In your .env file, verify the MONGO_URI is correct.');
      console.error('   - Check the username and password.');
      console.error('   - IMPORTANT: Use the DATABASE USER password, not your MongoDB Atlas account password.');
      console.error('3. Special Characters: If your password has special characters like @, :, #, or ?, they MUST be URL-encoded.');
      console.error('   - Example: a password like "my#pass" should be written as "my%23pass".');
      console.error('4. IP Access: In MongoDB Atlas, go to "Network Access" and ensure your current IP address is whitelisted.');
      console.error('   - For testing, you can temporarily allow access from anywhere with 0.0.0.0/0, but this is not secure.');
      console.error('--------------------------------------------------');
    } else {
      console.error('Failed to start server:', error.message);
    }
    process.exit(1);
  }
};

startServer();

module.exports = app;