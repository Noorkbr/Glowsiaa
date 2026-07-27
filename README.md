# Glowsiaa 💄✨

Bangladesh's premium cosmetics e-commerce platform — a full-stack monorepo with a storefront, admin panel, and REST API.

## Tech Stack

| Layer | Technologies |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS v3, Framer Motion, Lucide React, React Router v6, Axios |
| Admin | React 18, Vite, Tailwind CSS v3, Recharts, Framer Motion, Lucide React |
| Backend | Node.js, Express.js, Mongoose, JWT, bcryptjs, express-validator |
| Database | MongoDB (Atlas) |

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (or local MongoDB)

### 1. Clone & Install

```bash
git clone https://github.com/Noorkbr/Glowsiaa.git
cd Glowsiaa
cd server && npm install
cd ../client && npm install
cd ../admin && npm install
cd ..
```

### 2. Configure Environment

```bash
cp server/.env.example server/.env
# Edit server/.env with your MongoDB URI and JWT secret
```

### 3. Seed Database

```bash
cd server && npm run seed
```

**Admin credentials after seeding:**
- Email: `admin@glowsiaa.com`
- Password: `admin123`

### 4. Run Development

Open three terminal windows:

```bash
# Terminal 1 - Backend API
cd server && npm run dev

# Terminal 2 - Customer Storefront
cd client && npm run dev

# Terminal 3 - Admin Panel
cd admin && npm run dev
```

| Service | URL |
|---|---|
| Customer Storefront | http://localhost:5173 |
| Admin Panel | http://localhost:5174 |
| REST API | http://localhost:5000 |

## Project Structure

```
glowsiaa/
├── client/          # Customer-facing storefront (React + Vite)
│   └── src/
│       ├── api/         # Axios instance
│       ├── components/  # UI components (Navbar, Hero, Cart, etc.)
│       ├── context/     # CartContext, AuthContext
│       └── pages/       # Route pages
├── admin/           # Admin dashboard (React + Vite + Recharts)
│   └── src/
│       ├── api/         # Axios instance (adminToken)
│       ├── components/  # AdminLayout, etc.
│       └── pages/       # Dashboard, Orders, Products
├── server/          # REST API (Express + MongoDB)
│   ├── models/      # User, Product, Order
│   ├── routes/      # auth, products, orders, admin
│   ├── middleware/  # JWT auth, adminOnly
│   ├── server.js    # Entry point
│   └── seed.js      # Database seeder
└── package.json     # Monorepo root
```

## API Endpoints

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | /api/auth/register | Register user |
| POST | /api/auth/login | Login |
| GET | /api/auth/me | Get current user |

### Products
| Method | Endpoint | Description |
|---|---|---|
| GET | /api/products | List all products |
| GET | /api/products/:id | Get single product |
| POST | /api/products | Create product (admin) |
| PUT | /api/products/:id | Update product (admin) |
| DELETE | /api/products/:id | Delete product (admin) |

### Orders
| Method | Endpoint | Description |
|---|---|---|
| POST | /api/orders | Create order |
| GET | /api/orders | List all orders (admin) |
| GET | /api/orders/:orderId | Track order by ID |
| PUT | /api/orders/:id/status | Update order status (admin) |

### Admin
| Method | Endpoint | Description |
|---|---|---|
| GET | /api/admin/stats | Dashboard statistics |
| GET | /api/admin/revenue | Revenue chart data |
| GET | /api/admin/orders | All orders |
| POST | /api/admin/push-delivery | Push to delivery company |

## Design System

**Colors:**
- `glow-magenta` `#D5106E` — Primary CTAs, active states
- `glow-purple` `#6E3992` — Secondary accents, gradients
- `midnight` `#0B0B12` — Main background

**Fonts:** Space Grotesk (headings), Inter (body)

**Effects:**
- Glassmorphism navbar: `bg-midnight/50 backdrop-blur-lg`
- Neon glow buttons: `boxShadow: 0 0 20px rgba(213,16,110,0.5)`
- Framer Motion spring animations throughout

## License

MIT
