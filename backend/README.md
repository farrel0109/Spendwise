# SpendWise Backend API

Backend API untuk SpendWise Expense Tracker, dibangun dengan Express.js dan TypeScript.

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Clerk JWT Verification

## Struktur Folder

```
backend/
├── src/
│   ├── index.ts              # Entry point server
│   ├── middleware/
│   │   └── clerk.ts          # JWT verification middleware
│   ├── routes/
│   │   ├── categories.ts     # CRUD kategori
│   │   ├── transactions.ts   # CRUD transaksi
│   │   └── summary.ts        # Agregasi keuangan
│   └── db/
│       └── supabase.ts       # Supabase client
├── .env                      # Environment variables
├── package.json
└── tsconfig.json
```

## Environment Variables

Buat file `.env` di root folder backend:

```env
# Clerk Authentication
CLERK_SECRET_KEY=sk_test_xxxxx
CLERK_DOMAIN=your-app.clerk.accounts.dev

# Supabase Database
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_KEY=eyJxxxxx

# Server Config
PORT=3001
FRONTEND_URL=http://localhost:3000
```

## Instalasi

```bash
# Install dependencies
npm install

# Development mode
npm run dev

# Build untuk production
npm run build

# Jalankan production build
npm start
```

## API Endpoints

### Health Check

```
GET /health
Response: { "status": "ok", "timestamp": "..." }
```

### Categories

```
GET    /api/categories      # List semua kategori user
POST   /api/categories      # Buat kategori baru
DELETE /api/categories/:id  # Hapus kategori
```

**POST Body:**

```json
{
  "name": "Food",
  "color": "#ef4444"
}
```

### Transactions

```
GET    /api/transactions           # List transaksi (optional: ?month=2025-12)
POST   /api/transactions           # Buat transaksi baru
PATCH  /api/transactions/:id       # Update transaksi
DELETE /api/transactions/:id       # Hapus transaksi
```

**POST Body:**

```json
{
  "amount": 50000,
  "type": "expense",
  "category_id": 1,
  "description": "Makan siang",
  "txn_date": "2025-12-29"
}
```

### Summary

```
GET /api/summary?month=2025-12
```

**Response:**

```json
{
  "month": "2025-12",
  "totalIncome": 5000000,
  "totalExpense": 2500000,
  "balance": 2500000,
  "byCategory": [
    {
      "name": "Food",
      "color": "#ef4444",
      "total_expense": 500000,
      "total_income": 0
    }
  ]
}
```

## Authentication

Semua endpoint `/api/*` memerlukan header Authorization:

```
Authorization: Bearer <clerk_jwt_token>
```

Token didapat dari Clerk di frontend menggunakan `getToken()`.

## Error Responses

```json
{
  "error": "Error message"
}
```

| Status Code | Meaning                               |
| ----------- | ------------------------------------- |
| 400         | Bad Request - Missing required fields |
| 401         | Unauthorized - Invalid/missing token  |
| 500         | Internal Server Error                 |

## Deployment (Railway)

1. Connect GitHub repository
2. Set environment variables di Railway Dashboard
3. Deploy akan otomatis dari branch main
