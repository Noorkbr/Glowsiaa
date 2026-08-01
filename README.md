# Glowsiaa — Premium Cosmetics E-Commerce Platform

> **Glow Like Never Before** — A full-stack, production-ready cosmetics e-commerce platform built with React, Node.js, and MongoDB.

---

## 🔑 Admin Access Guide

### Default Credentials (after running the seed script)
| Field | Value |
|---|---|
| **URL** | `http://localhost:5174` (dev) or your admin domain |
| **Email** | `admin@glowsiaa.com` |
| **Password** | `admin123` |

> ⚠️ **Change the default password immediately after your first login in production.**

### How to Find / Reset Admin Credentials

Admin credentials are stored **hashed** in MongoDB. Use the built-in credential manager:

```bash
# Navigate to the server directory first
cd server

# 1. List all admin accounts
node create-admin.js

# 2. Reset the admin password to the default ("admin123")
node create-admin.js reset

# 3. Reset to a custom password
node create-admin.js reset MySecurePassword123

# 4. Create a brand-new admin account
node create-admin.js create admin@yourdomain.com MySecurePassword123
```

### Re-seeding the Database (WARNING: clears all data)
```bash
cd server
node seed.js
# Admin email: admin@glowsiaa.com | Password: admin123
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Storefront** | React 18, Vite, Tailwind CSS, Framer Motion, Lucide React |
| **Admin Panel** | React 18, Vite, Tailwind CSS, Framer Motion, Recharts |
| **Backend API** | Node.js, Express 5, MongoDB, Mongoose, JWT |
| **Auth** | JSON Web Tokens (JWT) + bcryptjs password hashing |
| **Payments** | bKash Tokenized, Nagad, COD, Rocket |
| **Delivery** | Pathao, Steadfast, RedX courier integrations |
| **File Uploads** | Multer (local) — swap for Cloudinary in production |
| **Rate Limiting** | express-rate-limit |

---

## 🏗️ Architecture

```
Glowsiaa/
├── server/          Node.js + Express + MongoDB API  → port 5000
├── client/          React 18 + Vite storefront        → port 5173
└── admin/           React 18 + Vite admin panel       → port 5174
```

---

## 🚀 A–Z Deployment Guide

### Prerequisites
- Node.js 18+ and npm 9+
- A MongoDB Atlas cluster (free tier works)
- A server or hosting platform (Railway, Render, VPS, etc.)

---

### Step 1 — Clone & Install Dependencies

```bash
git clone https://github.com/your-username/Glowsiaa.git
cd Glowsiaa

cd server && npm install && cd ..
cd client && npm install && cd ..
cd admin  && npm install && cd ..
```

---

### Step 2 — Configure Environment Variables

```bash
cd server
cp .env.example .env   # then edit the file
```

Required values in `server/.env`:

```env
PORT=5000
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/glowsiaa
JWT_SECRET=replace_with_a_long_random_string_at_least_32_chars
NODE_ENV=production
ALLOWED_ORIGINS=https://glowsiaa.com,https://admin.glowsiaa.com
CLIENT_URL=https://glowsiaa.com
SERVER_URL=https://api.glowsiaa.com
```

> Generate a secure JWT secret:
> ```bash
> node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
> ```

---

### Step 3 — Set Client-Side API URL

`client/.env.production`:
```env
VITE_API_URL=https://api.glowsiaa.com/api
```

`admin/.env.production`:
```env
VITE_API_URL=https://api.glowsiaa.com/api
```

---

### Step 4 — Seed the Database (first time only)

```bash
cd server
node seed.js
# Creates: admin@glowsiaa.com / admin123 + sample products
```

---

### Step 5 — Build Frontend Apps

```bash
cd client && npm run build   # → client/dist/
cd ../admin && npm run build # → admin/dist/
```

---

### Step 6 — Deploy the Backend

#### Option A — Railway / Render (Recommended)
1. Push code to GitHub.
2. Create a new Web Service → point to `server/` directory.
3. Start command: `node server.js`
4. Add all env variables from Step 2 in the dashboard.

#### Option B — VPS with PM2
```bash
npm install -g pm2
cd /var/www/glowsiaa/server
pm2 start server.js --name glowsiaa-api
pm2 save && pm2 startup
```

---

### Step 7 — Deploy Frontend (Static Files)

#### Option A — Netlify / Vercel
Drag and drop `client/dist/` and `admin/dist/` to separate Netlify sites.

#### Option B — Nginx on VPS
```nginx
server {
    server_name glowsiaa.com;
    root /var/www/glowsiaa/client/dist;
    location / { try_files $uri $uri/ /index.html; }
}
server {
    server_name admin.glowsiaa.com;
    root /var/www/glowsiaa/admin/dist;
    location / { try_files $uri $uri/ /index.html; }
}
server {
    server_name api.glowsiaa.com;
    location / { proxy_pass http://127.0.0.1:5000; }
}
```

Free SSL:
```bash
sudo certbot --nginx -d glowsiaa.com -d admin.glowsiaa.com -d api.glowsiaa.com
```

---

### Step 8 — Post-Deployment Checklist

- [ ] Reset admin password: `node create-admin.js reset <NewPassword>`
- [ ] Verify `ALLOWED_ORIGINS` matches live frontend URLs
- [ ] Set `NODE_ENV=production`
- [ ] Test admin login at `https://admin.yourdomain.com`
- [ ] Configure payment gateways in Admin → Payments
- [ ] Upload logo in Admin → Media
- [ ] Set store info in Admin → Settings

---

## 🚀 Quick Start (Local Development)

```bash
# Terminal 1 — Backend
cd server && npm install && cp .env.example .env && npm run dev

# Terminal 2 — Storefront
cd client && npm install && npm run dev

# Terminal 3 — Admin Panel
cd admin && npm install && npm run dev
```

---

## 🏛️ Design System

| Token | Value |
|---|---|
| Glow Magenta (Primary) | `#D5106E` |
| Glow Purple (Secondary) | `#6E3992` |
| Deep Midnight (BG) | `#05050A` |
| Surface Glass | `#0F0F1A` |

**Fonts:** Syne (headings) · Inter (body) · Lucide React (icons) · Framer Motion (animations)

---

## ✨ Feature Summary

### Storefront
- Aurora/glassmorphism homepage with animated hero carousel
- 3D tilt product cards, flash sale countdown timer
- Physics-based cart & checkout drawers
- Payment: COD · bKash · Nagad · Rocket (admin-toggled)
- Coupon codes, wishlist, order tracking
- YouTube product video embed on product detail pages
- WhatsApp floating button, scroll progress, lightweight product-page cursor
- Fully responsive mobile-first layout

### Admin Panel
- **Dashboard** — Revenue, KPI cards, recent orders
- **Products** — CRUD with images, YouTube video URL, featured toggle
- **Orders** — Status updates, Pathao/Steadfast/RedX push
- **Categories** — Hierarchical tree with emoji/gradient
- **Banners** — Hero + promo with live preview (scrollable modals)
- **Coupons** — % and fixed discount codes
- **Analytics** — Charts for revenue, orders, payment methods
- **Settings** — 7-tab CMS covering branding, SEO, payments, delivery

---

## 🔌 API Reference

| Resource | Endpoints |
|---|---|
| Auth | `POST /api/auth/register` · `POST /api/auth/login` · `GET /api/auth/me` |
| Products | `GET /api/products` · `GET /api/products/:id` · Admin CRUD |
| Orders | `POST /api/orders` · `GET /api/orders/:orderId` · Admin CRUD |
| Categories | `GET /api/categories` · Admin CRUD |
| Banners | `GET /api/banners` · Admin CRUD |
| Coupons | `POST /api/coupons/validate` · Admin CRUD |
| Settings | `GET /api/settings/public` · Admin bulk update |
| Payments | bKash · Nagad · Gateway status |
| Delivery | Pathao · Steadfast · RedX push |

---

## 🛡️ Security Notes

- Passwords hashed with **bcrypt** (10 salt rounds)
- API routes protected with **JWT Bearer tokens**
- Admin routes guarded by `adminOnly` middleware
- MongoDB injection prevented via `sanitizeFilter`
- Rate limiting on all endpoints
- **Never commit your `.env` file`
