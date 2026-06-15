<div align="center">

# 💸 Money Tracker

**Aplikasi pencatatan keuangan pribadi yang simpel, cepat, dan modern.**
Catat pengeluaran, pantau budget, dan analisis kebiasaan belanjamu — semuanya langsung di browser.

[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=flat-square&logo=vite)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38BDF8?style=flat-square&logo=tailwindcss)](https://tailwindcss.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-violet?style=flat-square)](LICENSE)

</div>

---

## ✨ Fitur Utama

| Fitur | Keterangan |
|---|---|
| 📅 **Setup Bulan** | Atur pemasukan & alokasi budget per kategori tiap bulan |
| ⚡ **Catat Cepat** | Input pengeluaran dalam < 10 detik |
| 📊 **Dashboard** | Ringkasan keuangan + progress budget per kategori |
| 📈 **Chart Harian** | Grafik pengeluaran per hari — hover untuk lihat detail transaksi |
| 🗂️ **Detail Kategori** | Rincian semua transaksi per kategori + edit & hapus |
| 🕓 **Riwayat Bulan** | Akses data bulan-bulan sebelumnya |
| 💾 **Export / Import** | Backup & restore data via file JSON |
| 🖥️ **Responsive** | Mobile-first + layout sidebar untuk desktop |
| 🔒 **100% Privat** | Semua data tersimpan lokal di browser, tanpa server |

---

## 🛠️ Tech Stack

- **Framework** — [React 18](https://react.dev) + [Vite 5](https://vitejs.dev)
- **Styling** — [Tailwind CSS 3](https://tailwindcss.com)
- **Routing** — [React Router v6](https://reactrouter.com)
- **Chart** — [Recharts](https://recharts.org)
- **Icons** — [Lucide React](https://lucide.dev)
- **Storage** — Browser LocalStorage (tanpa backend)
- **Testing** — [Vitest](https://vitest.dev) + [@testing-library/react](https://testing-library.com)

---

## 🚀 Memulai

### Prasyarat
- Node.js ≥ 18
- npm ≥ 9

### Instalasi

```bash
# Clone repo
git clone https://github.com/username/money-tracker.git
cd money-tracker

# Install dependencies
npm install

# Jalankan dev server
npm run dev
```

Buka [http://localhost:5173](http://localhost:5173) di browser.

---

## 📁 Struktur Proyek

```
src/
├── context/
│   └── BudgetContext.jsx       ← Global state + semua aksi CRUD
├── hooks/
│   ├── useStorage.js           ← Baca/tulis LocalStorage
│   └── useBudget.js            ← Kalkulasi budget & statistik
├── utils/
│   ├── currency.js             ← formatRupiah, parseRupiah
│   └── date.js                 ← formatDate, getCurrentMonthId, dll
├── components/
│   ├── layout/
│   │   ├── Sidebar.jsx         ← Navigasi sidebar (desktop)
│   │   ├── BottomNav.jsx       ← Navigasi bawah (mobile)
│   │   └── PageWrapper.jsx     ← Layout wrapper
│   ├── ui/
│   │   ├── Card.jsx
│   │   ├── Button.jsx
│   │   ├── Input.jsx
│   │   └── ProgressBar.jsx
│   └── dashboard/
│       ├── SummaryCard.jsx     ← Kartu gradient ringkasan keuangan
│       ├── CategoryCard.jsx    ← Kartu progress per kategori
│       └── SpendingChart.jsx   ← Bar chart pengeluaran harian
├── pages/
│   ├── Dashboard.jsx
│   ├── BudgetSetup.jsx
│   ├── AddExpense.jsx
│   ├── CategoryDetail.jsx
│   ├── History.jsx
│   └── Settings.jsx
└── App.jsx                     ← Routing + ProtectedRoute
```

---

## 🗄️ Struktur Data (LocalStorage)

Data disimpan dengan key `money-tracker-data` dalam format berikut:

```json
{
  "months": [
    {
      "id": "2026-06",
      "name": "Juni 2026",
      "income": 5000000,
      "categories": [
        { "id": "cat_1", "name": "Makan", "budget": 1500000 }
      ],
      "expenses": [
        {
          "id": "exp_1",
          "categoryId": "cat_1",
          "amount": 25000,
          "description": "Ayam Geprek",
          "createdAt": "2026-06-14T15:30:00.000Z"
        }
      ]
    }
  ]
}
```

---

## 🧪 Menjalankan Test

```bash
# Jalankan semua unit test
npm run test:run

# Jalankan dalam watch mode
npm run test
```

Test mencakup:
- `currency.js` — formatRupiah, parseRupiah
- `date.js` — formatDate, formatDateTime, getCurrentMonthId
- `useStorage.js` — read/write/default/invalid JSON
- `useBudget.js` — kalkulasi totalSpent, remaining, unallocated, categoryStats
- `BudgetContext.jsx` — addMonth, addExpense, editExpense, deleteExpense, clearAllData

---

## 📦 Build & Deploy

```bash
# Build untuk production
npm run build

# Preview hasil build
npm run preview
```

Output tersimpan di folder `dist/`. Siap di-deploy ke:

- **[Vercel](https://vercel.com)** — drag & drop folder `dist/`, atau connect repo GitHub
- **[Netlify](https://netlify.com)** — sama seperti Vercel

> ⚠️ Karena menggunakan React Router, tambahkan konfigurasi redirect berikut:
>
> **Vercel** → buat file `vercel.json`:
> ```json
> { "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
> ```
> **Netlify** → buat file `public/_redirects`:
> ```
> /* /index.html 200
> ```

---

## 💡 Cara Penggunaan

1. **Buka app** → otomatis diarahkan ke halaman Setup Bulan
2. **Isi pemasukan** dan buat kategori budget (Makan, Transport, dll)
3. **Klik "Catat"** di navbar untuk input pengeluaran
4. **Dashboard** menampilkan sisa uang, progress budget, dan chart harian
5. **Tap bar di chart** untuk melihat detail belanja per hari
6. **Klik kategori** di Dashboard untuk melihat daftar transaksi + edit/hapus
7. **Settings → Export JSON** secara rutin untuk backup data

---

## ⚠️ Perhatian Data

Data disimpan di **LocalStorage browser** — artinya:

- ✅ Tetap ada meskipun tab / browser ditutup
- ✅ Aman saat restart komputer
- ❌ Hilang jika **"Clear browsing data"** dijalankan (centang cookies & site data)
- ❌ Tidak tersinkron antar browser atau device
- ❌ Hilang jika membuka di mode **Incognito** lalu window ditutup

**Solusi:** Gunakan fitur **Export JSON** di Settings secara rutin sebagai backup. 💾

---

## 📄 Lisensi

Proyek ini menggunakan lisensi [MIT](LICENSE). Bebas digunakan dan dimodifikasi.

---

<div align="center">

Dibuat dengan ☕ dan 💜

</div>
# money-management-monthly
