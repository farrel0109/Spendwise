# SpendWise Frontend

Frontend untuk SpendWise Expense Tracker, dibangun dengan Next.js 16 dan TypeScript.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Authentication**: Clerk
- **HTTP Client**: Axios

## Struktur Folder

```
frontend/
├── src/
│   ├── app/
│   │   ├── layout.tsx           # Root layout + ClerkProvider
│   │   ├── page.tsx             # Landing page
│   │   ├── dashboard/
│   │   │   └── page.tsx         # Dashboard utama
│   │   ├── sign-in/
│   │   │   └── [[...sign-in]]/
│   │   │       └── page.tsx     # Halaman login
│   │   └── sign-up/
│   │       └── [[...sign-up]]/
│   │           └── page.tsx     # Halaman register
│   ├── components/
│   │   ├── TransactionForm.tsx  # Form tambah transaksi
│   │   ├── TransactionList.tsx  # List transaksi
│   │   ├── SummaryCards.tsx     # Kartu ringkasan keuangan
│   │   ├── ExpenseChart.tsx     # Pie chart pengeluaran
│   │   └── CategoryManager.tsx  # Kelola kategori
│   ├── lib/
│   │   └── api.ts               # API client + types
│   └── middleware.ts            # Clerk auth middleware
├── .env.local                   # Environment variables
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

## Environment Variables

Buat file `.env.local` di root folder frontend:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
CLERK_SECRET_KEY=sk_test_xxxxx

# Clerk Routes
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:3001
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

## Fitur

### 🏠 Landing Page

- Animasi gradient background
- Feature highlights
- CTA buttons untuk sign in/up

### 🔐 Authentication

- Login dengan Email atau Google (via Clerk)
- Protected routes dengan middleware
- User session management

### 📊 Dashboard

- **Overview Tab**: Summary cards, pie chart, quick add transaction
- **Transactions Tab**: Full transaction list dengan form
- **Categories Tab**: Manage categories dengan color picker

### 💰 Transaction Management

- Tambah income/expense
- Pilih kategori
- Filter by month
- Delete transactions

### 📈 Financial Insights

- Total Income
- Total Expenses
- Balance
- Expense breakdown by category (pie chart)

## Komponen

### TransactionForm

Form untuk menambah transaksi baru dengan:

- Toggle income/expense
- Amount input
- Description
- Category dropdown
- Date picker

### TransactionList

Menampilkan list transaksi dengan:

- Category color indicator
- Amount (hijau untuk income, merah untuk expense)
- Delete button (hover)

### SummaryCards

3 cards menampilkan:

- Total Income
- Total Expenses
- Balance

### ExpenseChart

Pie chart menggunakan Recharts menampilkan breakdown pengeluaran per kategori.

### CategoryManager

- Form buat kategori baru
- Color picker dengan preset colors
- List kategori dengan delete button

## API Integration

Semua API calls ada di `src/lib/api.ts`:

```typescript
// Get token dari Clerk
const token = await getToken();

// Panggil API
const categories = await getCategories(token);
const transactions = await getTransactions(token, "2025-12");
const summary = await getSummary(token, "2025-12");
```

## Deployment (Vercel)

1. Connect GitHub repository ke Vercel
2. Set environment variables:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`
   - `NEXT_PUBLIC_API_URL` (URL Railway backend)
3. Deploy akan otomatis dari branch main

## Development Notes

- Middleware warning "deprecated" bisa diabaikan (masih berfungsi)
- Pastikan backend sudah running sebelum test API calls
- Clerk keys harus valid untuk frontend bisa berjalan
