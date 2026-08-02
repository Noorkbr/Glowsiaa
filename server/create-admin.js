/**
 * Glowsiaa — Admin Credential Manager
 * =====================================
 * Usage:
 *   node create-admin.js                                    → list admin accounts
 *   node create-admin.js create <email> <password>          → create new admin
 *   node create-admin.js reset <password>                   → reset FIRST admin's password
 *   node create-admin.js set-password <email> <password>    → reset a specific admin's password
 *
 * Run from the /server directory with your .env configured.
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const connectDB = async () => {
  if (!process.env.MONGO_URI) {
    console.error('❌  MONGO_URI is not set in server/.env');
    process.exit(1);
  }
  // Apply the same DB-name normalisation as server.js so both scripts
  // always target the "glowsiaa" database, never the default "test" DB.
  const rawUri = process.env.MONGO_URI.trim().replace(/\r/g, '');
  const uri = rawUri.includes('/glowsiaa?') || rawUri.includes('/glowsiaa&') || rawUri.endsWith('/glowsiaa')
    ? rawUri
    : rawUri.replace(/\/(\?|$)/, '/glowsiaa$1');
  await mongoose.connect(uri);
  console.log('✅  Connected to MongoDB (database: glowsiaa)');
};

const showAdminInfo = async () => {
  const admins = await User.find({ role: 'admin' }).select('name email createdAt');
  if (admins.length === 0) {
    console.log('⚠️  No admin accounts found.');
    console.log('   Run: node create-admin.js create admin@glowsiaa.com YourPassword');
  } else {
    console.log(`\n👑  Found ${admins.length} admin account(s):\n`);
    admins.forEach((a) => console.log(`   📧  ${a.email}  (name: ${a.name}, created: ${a.createdAt.toDateString()})`));
  }
};

// Reset first admin found (kept for backward compat)
const resetAdminPassword = async (newPassword = 'Admin@1234') => {
  if (newPassword.length < 6) {
    console.error('❌  Password must be at least 6 characters.');
    process.exit(1);
  }
  const admin = await User.findOne({ role: 'admin' }).select('+password');
  if (!admin) {
    console.error('❌  No admin account found. Create one first:');
    console.error('   node create-admin.js create admin@glowsiaa.com YourPassword');
    process.exit(1);
  }
  // Assign plain text — the mongoose pre("save") hook in User.js bcrypt-hashes it.
  // Do NOT call bcrypt.hash() here; that would cause double-hashing and break login.
  admin.password = newPassword;
  await admin.save();
  console.log(`\n✅  Password reset for ${admin.email}`);
  console.log(`   New password: ${newPassword}`);
  console.log('\n   ⚠️  Change this password after your first login!');
};

// Reset a specific admin by email
const setPasswordByEmail = async (email, newPassword) => {
  if (!email || !newPassword) {
    console.error('❌  Usage: node create-admin.js set-password <email> <password>');
    process.exit(1);
  }
  if (newPassword.length < 6) {
    console.error('❌  Password must be at least 6 characters.');
    process.exit(1);
  }
  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user) {
    console.error(`❌  No user found with email: ${email}`);
    process.exit(1);
  }
  // Assign plain text — pre-save hook hashes it correctly.
  user.password = newPassword;
  user.role = 'admin'; // ensure admin role
  await user.save();
  console.log(`\n✅  Password updated for ${user.email}`);
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
  const existing = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (existing) {
    // Update both role AND password so existing plain-text passwords are fixed too.
    existing.role = 'admin';
    existing.password = password; // pre-save hook will hash it
    await existing.save();
    console.log(`\n✅  Existing user ${email} promoted to admin with new password.`);
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
        await resetAdminPassword(arg1 || 'Admin@1234');
        break;
      case 'set-password':
        await setPasswordByEmail(arg1, arg2);
        break;
      case 'create':
        await createAdminUser(arg1, arg2);
        break;
      default:
        await showAdminInfo();
        console.log(`
──────────────────────────────────────────────────────────────────
Available commands:
  node create-admin.js                                List admin accounts
  node create-admin.js create <email> <pass>          Create / promote to admin
  node create-admin.js reset <pass>                   Reset FIRST admin password
  node create-admin.js set-password <email> <pass>    Reset a specific admin password
──────────────────────────────────────────────────────────────────`);
    }
  } catch (err) {
    console.error('❌  Error:', err.message);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

run();
