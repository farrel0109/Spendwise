# SpendWise - Smart Financial Manager

SpendWise adalah aplikasi manajemen keuangan pribadi yang modern, minimalis, dan powerful. Didesain dengan gaya **iOS/Apple aesthetic** yang bersih dan profesional, SpendWise membantu Anda melacak kekayaan bersih, mengelola banyak akun, merencanakan anggaran, dan mencapai tujuan finansial dengan cara yang menyenangkan melalui gamifikasi.

![SpendWise](https://img.shields.io/badge/SpendWise-v2.0-007aff?style=for-the-badge&logo=apple) ![Status](https://img.shields.io/badge/Status-Beta-34c759?style=for-the-badge) [![GitHub](https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge&logo=github)](https://github.com/farrel0109/Spendwise)

## ✨ Fitur Utama

### 📱 Desain Premium & Responsif

- **iOS-Style UI**: Tampilan minimalis, bersih, dan elegan dengan tipografi SF Pro/Inter.
- **Professional Icons**: Menggunakan Lucide React icons untuk tampilan yang konsisten dan modern.
- **Fully Responsive**: Optimal di semua perangkat - Mobile (Bottom Nav), Tablet, dan Laptop (Sidebar).
- **Dark Mode**: Interface gelap yang nyaman di mata (OLED friendly).

### 💰 Manajemen Keuangan Komprehensif

- **Multi-Account Tracking**: Kelola berbagai jenis akun (Bank, E-Wallet, Cash, Investasi, Kartu Kredit, Pinjaman).
- **Net Worth Tracking**: Pantau total kekayaan bersih (Aset - Liabilitas) secara real-time.
- **Smart Transactions**: Catat pemasukan, pengeluaran, dan transfer antar akun dengan mudah.
- **Emotion Tracking**: Catat perasaan Anda saat bertransaksi untuk memahami psikologi belanja Anda.

### 🎯 Perencanaan & Analisis

- **Budgeting**: Tetapkan batas pengeluaran per kategori dan dapatkan peringatan saat mendekati batas.
- **Savings Goals**: Buat target tabungan (misal: Liburan, Gadget) dan lacak progresnya.
- **Debt Manager**: Kelola hutang piutang pribadi dengan teman atau keluarga.
- **Deep Analytics**: Analisis tren pengeluaran, kategori terboros, dan skor kesehatan finansial.

### 🎮 Gamifikasi Finansial

- **Leveling System**: Dapatkan XP dari setiap aktivitas finansial yang sehat.
- **Streak Tracking**: Bangun kebiasaan baik dengan check-in harian.
- **Achievements**: Buka lencana penghargaan untuk pencapaian finansial tertentu.
- **Financial Score**: Skor kesehatan finansial otomatis berdasarkan kebiasaan Anda.

## 🚀 Tech Stack

| Layer        | Technology                                                                   |
| ------------ | ---------------------------------------------------------------------------- |
| **Frontend** | Next.js 16 (App Router), TypeScript, Tailwind CSS v4, Lucide React, Recharts |
| **Backend**  | Express.js, TypeScript, Node.js                                              |
| **Database** | Supabase (PostgreSQL) dengan Row Level Security (RLS)                        |
| **Auth**     | Clerk (Secure Authentication)                                                |
| **State**    | React Hooks, SWR pattern                                                     |

## 📁 Struktur Project

```
SpendWise/
├── frontend/          # Next.js App (UI & Client Logic)
├── backend/           # Express API (Business Logic)
└── database/          # SQL Schema & Functions
    ├── schema.sql     # Struktur Database
    └── functions.sql  # Database Triggers & Functions
```

## ⚡ Cara Menjalankan

### 1. Clone & Install

```bash
# Frontend
cd frontend
npm install

# Backend
cd backend
npm install
```

### 2. Setup Database (Supabase)

1. Buat project baru di [Supabase](https://supabase.com).
2. Jalankan script `database/schema.sql` di SQL Editor.
3. Jalankan script `database/functions.sql` di SQL Editor.
4. Ambil URL Project dan Service Role Key.

### 3. Setup Auth (Clerk)

1. Buat aplikasi di [Clerk](https://clerk.com).
2. Ambil Publishable Key dan Secret Key.

### 4. Konfigurasi Environment

**Backend** (`backend/.env`):

```env
# Salin dari backend/.env.example
CLERK_SECRET_KEY=sk_test_your_clerk_secret_key_here
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your_service_key_here
PORT=3001
FRONTEND_URL=http://localhost:3000
```

**Frontend** (`frontend/.env.local`):

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
CLERK_SECRET_KEY=sk_test_xxxxx
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
NEXT_PUBLIC_API_URL=http://localhost:3001
```

> ⚠️ **PENTING**: File `.env` dan `.env.local` sudah di-ignore oleh git. Jangan pernah commit file yang berisi secret keys!

### 5. Jalankan Aplikasi

```bash
# Terminal 1 (Backend)
cd backend
npm run dev

# Terminal 2 (Frontend)
cd frontend
npm run dev
```

Buka **http://localhost:3000** di browser Anda.

## 🔒 Keamanan

- **Secure Auth**: Menggunakan Clerk untuk manajemen sesi yang aman.
- **Row Level Security**: Data di database terlindungi di level baris (RLS).
- **Data Validation**: Validasi input ketat di frontend dan backend (Zod).
- **Environment Variables**: Semua secret keys disimpan di file `.env` yang di-ignore oleh git.
- **No Hardcoded Secrets**: Tidak ada API key atau password yang di-hardcode di source code.

### File yang Di-ignore (`.gitignore`):

```
.env
.env.local
.env.*
node_modules/
.next/
dist/
```

## 🤝 Contributing

Kontribusi sangat diterima! Silakan:

1. Fork repository ini
2. Buat branch baru (`git checkout -b feature/AmazingFeature`)
3. Commit perubahan (`git commit -m 'Add some AmazingFeature'`)
4. Push ke branch (`git push origin feature/AmazingFeature`)
5. Buka Pull Request

### Setup untuk Contributor

1. Clone repository:
   ```bash
   git clone https://github.com/farrel0109/Spendwise.git
   cd Spendwise
   ```
2. Salin file `.env.example` ke `.env` di folder backend.
3. Buat file `.env.local` di folder frontend (lihat contoh di atas).
4. Ikuti langkah "Cara Menjalankan" di atas.

## 📝 Lisensi

MIT License - Bebas digunakan dan dimodifikasi.
