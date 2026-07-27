# Glowsiaa — Premium Beauty E-Commerce Platform

Bangladesh's #1 premium cosmetics store. Full-stack MERN application with a customer storefront, admin dashboard, and REST API.

---

## Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS, Framer Motion, Lucide React, react-hot-toast |
| **Admin** | React 18, Vite, Tailwind CSS, Recharts |
| **Backend** | Node.js, Express.js, Mongoose |
| **Database** | MongoDB Atlas |
| **Auth** | JWT (7-day tokens), bcryptjs |

---

## Project Structure

```
Glowsiaa/
├── server/       # Express API (port 5000)
├── client/       # Customer storefront (port 5173)
└── admin/        # Admin panel (port 5174)
```

---

## Quick Start

### 1. Server Setup

```bash
cd server
npm install
cp .env.example .env   # Fill in your values
npm run dev
```

**`.env` variables:**
```
PORT=5000
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/glowsiaa
JWT_SECRET=your-super-secret-key
NODE_ENV=development
```

**Seed the database** (creates admin + 8 products + 5 sample orders):
```bash
npm run seed
```

Default admin credentials after seeding:
- Email: `admin@glowsiaa.com`
- Password: `admin123`

### 2. Client (Customer Store)

```bash
cd client
npm install
npm run dev     # http://localhost:5173
```

### 3. Admin Panel

```bash
cd admin
npm install
npm run dev     # http://localhost:5174
```

---

## Features

### Customer Store
- 🛍️ **Product Catalog** — Browse, filter by category, search with live results
- ❤️ **Wishlist** — Save favourites, persisted in localStorage
- 🛒 **Cart** — Persistent cart with quantity management
- 📦 **Checkout** — 2-step checkout with address & payment
- 🚚 **Order Tracking** — Real-time order status with GLS-XXXXXX ID
- 👤 **Account Page** — View order history (requires login)
- 🔐 **Auth** — Register & Login with JWT

### Admin Panel
- 📊 **Dashboard** — Revenue chart, order stats, recent orders
- 📦 **Orders** — Manage statuses, push to Pathao / Steadfast / RedX
- 🛍️ **Products** — Full CRUD with image URLs, featured toggle
- 👥 **Users** — Searchable customer list with pagination
- ⚙️ **Settings** — Change password via API, store preferences

---

## API Endpoints

| Method | Route | Description |
|---|---|---|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user |
| GET | `/api/auth/orders` | User's own orders |
| PUT | `/api/auth/change-password` | Change password |
| GET | `/api/products` | List products (filter, search) |
| GET | `/api/products/:id` | Get single product |
| POST | `/api/products` | Create product (admin) |
| PUT | `/api/products/:id` | Update product (admin) |
| DELETE | `/api/products/:id` | Delete product (admin) |
| POST | `/api/orders` | Place an order |
| GET | `/api/orders/:orderId` | Track order by ID |
| GET | `/api/admin/stats` | Dashboard stats |
| GET | `/api/admin/revenue` | 30-day revenue data |
| GET | `/api/admin/orders` | All orders |
| GET | `/api/admin/users` | All users (searchable, paginated) |
| POST | `/api/admin/push-delivery` | Push order to courier |

---

## Deployment Notes

- Set `NODE_ENV=production` on your server
- Set CORS origin to your frontend domain in `server.js`
- Build client: `cd client && npm run build` → serve `dist/`
- Build admin: `cd admin && npm run build` → serve `dist/` on a subdomain

---

© 2026 Glowsiaa. All rights reserved.
