/**
 * Glowsiaa — Admin Credential Manager
 * =====================================
 * Usage:
 *   node create-admin.js                        → shows current admin info
 *   node create-admin.js reset                  → resets password to "admin123"
 *   node create-admin.js reset MyNewPassword99  → resets to a custom password
 *   node create-admin.js create admin@email.com Password123
 *
 * Run from the /server directory with your .env configured.
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

const connectDB = async () => {
  if (!process.env.MONGO_URI) {
    console.error('❌  MONGO_URI is not set in server/.env');
    process.exit(1);
  }
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅  Connected to MongoDB');
};

const showAdminInfo = async () => {
  const admins = await User.find({ role: 'admin' }).select('name email createdAt');
  if (admins.length === 0) {
    console.log('⚠️  No admin accounts found. Run: node create-admin.js create admin@glowsiaa.com YourPassword');
  } else {
    console.log(`\n👑  Found ${admins.length} admin account(s):\n`);
    admins.forEach((a) => console.log(`   📧  ${a.email}  (name: ${a.name}, created: ${a.createdAt.toDateString()})`));
  }
};

const resetAdminPassword = async (newPassword = 'admin123') => {
  if (newPassword.length < 6) {
    console.error('❌  Password must be at least 6 characters.');
    process.exit(1);
  }
  const admin = await User.findOne({ role: 'admin' }).select('+password');
  if (!admin) {
    console.error('❌  No admin account found. Create one first with: node create-admin.js create email@example.com Password123');
    process.exit(1);
  }
  const salt = await bcrypt.genSalt(10);
  admin.password = await bcrypt.hash(newPassword, salt);
  await admin.save({ validateBeforeSave: false });
  console.log(`\n✅  Password reset for ${admin.email}`);
  console.log(`   New password: ${newPassword}`);
  console.log('\n   ⚠️  Change this password after your first login!');
};

const createAdminUser = async (email, password) => {
  if (!email || !password) {
    console.error('❌  Usage: node create-admin.js create <email> <password>');
    process.exit(1);
  }
  if (password.length < 6) {
    console.error('❌  Password must be at least 6 characters.');
    process.exit(1);
  }
  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    existing.role = 'admin';
    await existing.save();
    console.log(`\n✅  Existing user ${email} promoted to admin.`);
  } else {
    await User.create({ name: 'Admin', email: email.toLowerCase(), password, role: 'admin' });
    console.log(`\n✅  Admin account created: ${email}`);
  }
};

const run = async () => {
  try {
    await connectDB();
    const [, , command, arg1, arg2] = process.argv;

    switch (command) {
      case 'reset':
        await resetAdminPassword(arg1 || 'admin123');
        break;
      case 'create':
        await createAdminUser(arg1, arg2);
        break;
      default:
        await showAdminInfo();
        console.log(`
──────────────────────────────────────────────
Available commands:
  node create-admin.js                           List admin accounts
  node create-admin.js reset                     Reset password → "admin123"
  node create-admin.js reset <NewPassword>       Reset to custom password
  node create-admin.js create <email> <pass>     Create new admin account
──────────────────────────────────────────────`);
    }
  } catch (err) {
    console.error('❌  Error:', err.message);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

run();

