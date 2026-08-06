# 🍲 Food Store Order Management System

A simple, fast, and real-time order management platform for food store branches (FC Road, Kothrud, Camp & Viman Nagar) featuring popular food delicacies (Puneri Misal Pav, Kanda Poha, Vada Pav, Chitale Bhakarwadi, Mango Mastani, etc.). Built with **Node.js, Express, MongoDB, Socket.IO**, and **Next.js**.

---

## 🌐 Live Deployments
- **Frontend App (Vercel)**: [https://order-management-system-beryl-alpha.vercel.app/](https://order-management-system-beryl-alpha.vercel.app/)
- **Backend Service (Render)**: [https://order-management-system-nfer.onrender.com/](https://order-management-system-nfer.onrender.com/)

---

## 📑 Table of Contents
- [Architecture & Tech Stack](#-architecture--tech-stack)
- [Task 1: Multi-Store Order Management System](#-task-1-multi-store-order-management-system)
- [Task 2: Real-Time Notification System](#-task-2-real-time-notification-system)
- [Task 3: Data Archival & Analytics](#-task-3-data-archival--analytics)
- [Database Indexes](#-database-indexes)
- [Setup & Installation Instructions](#-setup--installation-instructions)
- [Database Seeding](#-database-seeding)
- [API Documentation](#-api-documentation)

---

## 🏗 Architecture & Tech Stack

```
Store/
├── backend/                  # Node.js + Express (JavaScript ES Modules)
│   ├── src/
│   │   ├── config/           # MongoDB database connection (Mongoose)
│   │   ├── controllers/      # Order, Archive, and Analytics controllers
│   │   ├── models/           # Mongoose schemas (Order.js & OrderArchive.js)
│   │   ├── routes/           # Express REST API routes
│   │   ├── sockets/          # Socket.IO real-time room broadcasting service
│   │   ├── validators/       # Zod validation schemas
│   │   ├── middlewares/      # Zod validator & error handling middlewares
│   │   ├── seed/             # Automated database seeding script
│   │   └── server.js         # Entrypoint HTTP & WebSocket server
│   ├── package.json
│   └── .env.example
├── frontend/                 # Next.js 14 App Router (JavaScript/JSX)
│   ├── src/
│   │   ├── app/              # App router pages (Create, List, Status, Analytics, Archive)
│   │   ├── components/       # Reusable UI components & Live Socket indicators
│   │   ├── lib/              # API fetch client & Socket instance
│   │   └── providers/        # React Query & Socket Context Providers
│   └── package.json
└── README.md                 # Complete documentation
```

### Backend
- **Node.js + Express.js**: REST API server & HTTP handling.
- **MongoDB + Mongoose**: Document storage with compound index optimization.
- **Socket.IO**: Real-time event broadcasting with room isolation per store.
- **Zod**: Input validation for order payloads and status transitions.

### Frontend
- **Next.js 14 (App Router)**: Fast rendering, layout routing, server/client components.
- **TanStack React Query**: Intelligent client caching, background refetching, and automatic cache invalidation on socket events.
- **Tailwind CSS**: Sleek dark-mode aesthetic with glassmorphism, responsive navigation, and micro-animations.
- **Recharts**: Data visualization for aggregation metrics.

---

## 🧩 Task 1: Multi-Store Order Management System

### Order Schema (`Order.js`)
```json
{
  "id": "ORD-SEED-0001",
  "store_id": "store_downtown",
  "items": [
    {
      "item_id": "ITEM-001",
      "item_name": "Artisanal Espresso",
      "price": 4.5,
      "qty": 2
    }
  ],
  "total_amount": 9.0,
  "status": "PLACED",
  "created_at": "2026-07-23T20:00:00.000Z"
}
```

### REST Endpoints
- `POST /api/orders` → Create a new order (with Zod schema validation).
- `GET /api/orders?store_id=&page=&limit=&status=` → Paginated list of orders filtered by store or status.
- `PATCH /api/orders/:id/status` → Update order status (`PLACED` → `PREPARING` → `COMPLETED`).

---

## ⚡ Task 2: Real-Time Notification System

- **WebSocket Connection**: Built on Socket.IO with auto-reconnect handling and status pills (Connected / Reconnecting / Disconnected).
- **Store-Based Event Filtering**: Clients can join store rooms (`socket.emit('join:store', storeId)`) to filter updates for specific store locations or subscribe to global updates.
- **Live UI Updates**: When an order is created or status is updated, Socket events (`order:created`, `order:updated`) invalidate React Query caches to instantly render updates without page reloads.

---

## 📊 Task 3: Data Archival & Analytics

### 1. Data Archival (`POST /api/archive-old-orders`)
Moves orders created older than 30 days (configurable) from `orders` into `orders_archive` using batch inserts and atomic deletion.

### 2. Aggregation Pipelines (`/api/analytics/*`)
- **Orders Per Day**: `$group` on `$dateToString` (`%Y-%m-%d`), calculating order count and daily revenue.
- **Revenue Per Store**: `$group` by `store_id`, calculating total revenue, order count, and average order value.
- **Top 5 Selling Items**: `$unwind` on `items`, `$group` by `items.item_id`, calculating total units sold and item revenue.

---

## 🎯 Database Indexes

To optimize performance and eliminate full collection scans:
1. `store_id: 1` — Fast single-store queries.
2. `created_at: -1` — Fast timeline queries.
3. Compound Index `{ store_id: 1, created_at: -1 }` — Optimizes paginated order queries filtering by store sorted by newest first.

---

## 🛠 Setup & Installation Instructions

### Prerequisites
- Node.js (v18+)
- MongoDB (running locally on `mongodb://localhost:27017` or MongoDB Atlas URI)

### 1. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env

# Run database seeder (seeds 150 sample orders over 60 days)
npm run seed

# Start development server
npm run dev
```
Backend will run at: `http://localhost:5000`

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start Next.js development server
npm run dev
```
Frontend will run at: `http://localhost:3000`

---

## 🧪 Database Seeding

To populate realistic sample stores, items, and historical orders over 60 days:

```bash
cd backend
npm run seed
```

---

## 📚 API Documentation

### 1. Create Order
- **URL**: `POST /api/orders`
- **Body**:
```json
{
  "store_id": "store_downtown",
  "items": [
    { "item_id": "ITEM-001", "item_name": "Artisanal Espresso", "price": 4.5, "qty": 2 }
  ]
}
```
- **Response** (`201 Created`):
```json
{
  "success": true,
  "message": "Order created successfully",
  "data": {
    "id": "ORD-LXYZ12-A1B2",
    "store_id": "store_downtown",
    "items": [...],
    "total_amount": 9.0,
    "status": "PLACED",
    "created_at": "2026-07-23T22:00:00.000Z"
  }
}
```

### 2. Fetch Orders (Paginated)
- **URL**: `GET /api/orders?store_id=store_downtown&page=1&limit=10&status=PLACED`
- **Response** (`200 OK`):
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "total": 25,
    "page": 1,
    "limit": 10,
    "totalPages": 3,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

### 3. Update Order Status
- **URL**: `PATCH /api/orders/:id/status`
- **Body**: `{ "status": "COMPLETED" }`
- **Response** (`200 OK`):
```json
{
  "success": true,
  "message": "Order status updated successfully",
  "data": { ... }
}
```

### 4. Archive Old Orders
- **URL**: `POST /api/archive-old-orders`
- **Body**: `{ "days": 30 }`
- **Response** (`200 OK`):
```json
{
  "success": true,
  "message": "Successfully archived 42 orders older than 30 days",
  "archivedCount": 42
}
```

### 5. Analytics: Revenue Per Store
- **URL**: `GET /api/analytics/revenue-per-store`
- **Response** (`200 OK`):
```json
{
  "success": true,
  "data": [
    {
      "store_id": "store_downtown",
      "total_revenue": 1420.50,
      "total_orders": 45,
      "avg_order_value": 31.57
    }
  ]
}
```
