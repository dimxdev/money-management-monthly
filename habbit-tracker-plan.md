# Habbit Tracker — Build Plan

## Project Overview

Aplikasi web pribadi untuk mengatur jadwal mingguan harian. Full Frontend, tidak ada backend.  
Data disimpan di LocalStorage browser.

---

## Tech Stack & Dependencies

- React + TypeScript (Vite template: `react-ts`)
- Tailwind CSS v3 + PostCSS + Autoprefixer
- React Router DOM v6
- Lucide React (icons)
- jsPDF + jspdf-autotable (export PDF)

**Install commands (jalankan di root project):**
```bash
npm install react-router-dom lucide-react jspdf jspdf-autotable
npm install -D tailwindcss@3 postcss autoprefixer
npx tailwindcss init -p
```

---

## Color Palette (Ocean Calm Theme)

| Nama        | Hex       | Tailwind Key  | Penggunaan                              |
|-------------|-----------|---------------|----------------------------------------|
| Deep Navy   | `#0A2540` | `deep-navy`   | Header, teks utama, bottom nav active  |
| Ocean Blue  | `#1B6CA8` | `ocean-blue`  | Primary button, highlight aktif        |
| Sky Tint    | `#5BA4CF` | `sky-tint`    | Badge, secondary info, border aktif    |
| Mist        | `#D6E6F2` | `mist`        | Background card tipis, border          |
| Cloud White | `#F7FAFC` | `cloud-white` | Background halaman utama, card         |

---

## Data Structure

**LocalStorage key: `habbit-tracker-data`**

```json
{
  "schedule": {
    "monday":    [{ "id": "abc1", "start": "08:00", "end": "09:30", "activity": "Olahraga" }],
    "tuesday":   [],
    "wednesday": [],
    "thursday":  [],
    "friday":    [],
    "saturday":  [],
    "sunday":    []
  }
}
```

**TypeScript Types (`src/types/index.ts`):**
```typescript
export interface TimeSlot {
  id: string;
  start: string;   // format "HH:MM"
  end: string;     // format "HH:MM"
  activity: string; // boleh kosong string ""
}

export type DayKey =
  | 'monday' | 'tuesday' | 'wednesday' | 'thursday'
  | 'friday' | 'saturday' | 'sunday';

export interface ScheduleData {
  monday: TimeSlot[];
  tuesday: TimeSlot[];
  wednesday: TimeSlot[];
  thursday: TimeSlot[];
  friday: TimeSlot[];
  saturday: TimeSlot[];
  sunday: TimeSlot[];
}

export interface AppData {
  schedule: ScheduleData;
}
```

---

## Pages & Routes

| Route       | File                    | Fungsi                                                         |
|-------------|-------------------------|----------------------------------------------------------------|
| `/`         | `pages/Dashboard.tsx`   | Tanggal hari ini, kata motivasi harian, jadwal hari ini        |
| `/schedule` | `pages/Schedule.tsx`    | Atur jadwal per hari (Sen–Min), add/edit/delete/copy slot      |
| `/settings` | `pages/Settings.tsx`    | Export/Import JSON, Export PDF, Hapus data, QRIS, WA link      |

Navigation: **Bottom Navigation Bar** (3 tab: Dashboard, Jadwal, Settings)

---

## Build Steps

### Step 1 — Config & Base Setup

**1a. `tailwind.config.js`** — tambah custom colors & font:
```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'deep-navy':   '#0A2540',
        'ocean-blue':  '#1B6CA8',
        'sky-tint':    '#5BA4CF',
        'mist':        '#D6E6F2',
        'cloud-white': '#F7FAFC',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
```

**1b. `index.html`** — ubah title & tambah Google Font Inter:
```html
<title>Habbit Tracker</title>
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
```

**1c. `src/index.css`** — hanya Tailwind directives:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

**1d. `src/main.tsx`** — wrap dengan BrowserRouter:
```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
```

**1e. `src/App.tsx`** — setup routes:
```tsx
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Schedule from './pages/Schedule';
import Settings from './pages/Settings';

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/schedule" element={<Schedule />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}
```

---

### Step 2 — Types & Data

**2a. `src/types/index.ts`** — sudah dituliskan di atas (TimeSlot, DayKey, ScheduleData, AppData)

**2b. `src/data/motivations.ts`** — array 100 kata motivasi produktif Bahasa Indonesia:
```typescript
export const motivations: string[] = [
  "Mulai sekarang, bukan besok. Besok hanya ada bagi mereka yang tidak memulai hari ini.",
  "Setiap hari adalah kesempatan baru untuk menjadi versi terbaik dirimu.",
  "Disiplin adalah jembatan antara tujuan dan pencapaian.",
  "Jangan tunggu sempurna. Mulai, perbaiki sambil berjalan.",
  "Kebiasaan kecil setiap hari menghasilkan perubahan besar seiring waktu.",
  "Produktivitas bukan tentang sibuk, tapi tentang hasil.",
  "Fokus pada prosesnya, bukan hasilnya — hasil akan mengikuti.",
  "Satu langkah kecil lebih baik dari seribu rencana tanpa aksi.",
  "Waktu yang terbuang tidak bisa dikembalikan. Gunakan setiap menit dengan bijak.",
  "Kamu tidak harus hebat untuk memulai, tapi kamu harus memulai untuk menjadi hebat.",
  "Konsistensi mengalahkan motivasi. Lakukan meski tidak mood.",
  "Hari ini kamu menanam kebiasaan, esok kebiasaan itu membentukmu.",
  "Jangan bandingkan perjalananmu dengan orang lain. Ini bukan perlombaan.",
  "Sukses adalah kebiasaan, bukan keberuntungan.",
  "Pagi yang baik dimulai dari keputusan untuk bangun dan bergerak.",
  "Tantangan hari ini adalah kekuatan hari esok.",
  "Setiap menit yang kamu manfaatkan adalah investasi untuk masa depanmu.",
  "Kerja keras diam-diam, biarkan hasilnya yang berteriak.",
  "Prioritaskan yang penting, bukan yang mendesak.",
  "Tubuhmu melakukan apa yang pikiranmu percaya.",
  "Bukan seberapa cepat kamu berlari, tapi seberapa jauh kamu tidak berhenti.",
  "Setiap orang sukses pernah merasa ingin menyerah — mereka memilih untuk tidak.",
  "Jadikan produktivitas sebagai gaya hidup, bukan tren sementara.",
  "Tidak ada yang namanya tidak punya waktu — semua tentang prioritas.",
  "Rencana tanpa eksekusi adalah mimpi. Eksekusi tanpa rencana adalah kekacauan.",
  "Bangun karena alarm, bukan karena keterpaksaan.",
  "Setiap hari ada 24 jam — orang sukses menggunakannya secara berbeda.",
  "Kelelahan yang produktif lebih baik dari istirahat yang malas.",
  "Buat jadwalmu, jangan biarkan jadwal membuat kamu.",
  "Satu jam fokus lebih berharga dari delapan jam setengah-setengah.",
  "Perubahan besar dimulai dari keputusan kecil yang dilakukan setiap hari.",
  "Jangan tunda sampai besok apa yang bisa kamu selesaikan hari ini.",
  "Energimu adalah sumber daya terbatas — investasikan dengan bijak.",
  "Rutinitas yang kuat adalah fondasi kehidupan yang produktif.",
  "Bukan bakat yang membedakan, tapi kedisiplinan.",
  "Kamu adalah apa yang kamu lakukan setiap hari, bukan sekali-sekali.",
  "Tidur lebih awal, bangun lebih awal — atur hidupmu sebelum hidup mengaturmu.",
  "Setiap tugas yang diselesaikan adalah satu beban yang terangkat.",
  "Berhenti mencari motivasi — ciptakan kebiasaan yang tidak butuh motivasi.",
  "Otak yang terlatih lebih kuat dari otak yang hanya berbakat.",
  "Jadikan 'selesaikan' sebagai kata favoritmu hari ini.",
  "Tidak ada shortcut menuju kerja keras yang konsisten.",
  "Hari yang baik dimulai dari niat yang kuat saat bangun pagi.",
  "Progress kecil tetaplah progress — jangan remehkan langkah kecilmu.",
  "Ambisi tanpa disiplin adalah khayalan.",
  "Fokusmu adalah superkekuatanmu — jaga dari gangguan.",
  "Deadline bukan musuh — ia adalah temanmu untuk menyelesaikan sesuatu.",
  "Mulai dengan apa yang kamu punya, dari mana kamu berada.",
  "Satu keputusan baik sehari bisa mengubah hidupmu dalam setahun.",
  "Produktif bukan berarti tidak beristirahat — istirahat adalah bagian dari strategi.",
  "Kamu lebih mampu dari yang kamu pikir — buktikan hari ini.",
  "Setiap masalah yang kamu hadapi adalah kesempatan untuk tumbuh.",
  "Jangan biarkan rasa nyaman menghalangi pertumbuhanmu.",
  "Investasikan waktu untuk belajar — pengetahuan tidak pernah sia-sia.",
  "Kerja cerdas lebih penting dari kerja keras — tapi keduanya tetap perlu.",
  "Hidupmu adalah hasil dari pilihan-pilihanmu setiap hari.",
  "Saat kamu merasa lelah, ingat kenapa kamu memulai.",
  "Setiap jam yang terlewat adalah kesempatan yang tidak bisa kembali.",
  "Jadikan to-do list sebagai janjimu kepada diri sendiri.",
  "Orang-orang terhebat adalah mereka yang paling disiplin, bukan paling pintar.",
  "Buat dirimu bangga dengan apa yang kamu lakukan hari ini.",
  "Waktu adalah satu-satunya sumber daya yang tidak bisa ditambah — gunakan dengan serius.",
  "Jangan tunggu inspirasi — mulai bekerja dan inspirasi akan datang.",
  "Kamu bisa mengeluh tentang masalah, atau bisa menyelesaikannya. Pilih yang kedua.",
  "Selesaikan yang paling sulit lebih dulu — sisanya akan terasa mudah.",
  "Setiap malam tanya: apakah hari ini aku sudah lebih baik dari kemarin?",
  "Keberhasilan bukan tentang kesempatan — tapi tentang kesiapan bertemu kesempatan.",
  "Tidak ada waktu yang sempurna — mulai sekarang adalah waktu terbaik.",
  "Bukan tentang seberapa banyak yang kamu kerjakan, tapi seberapa berarti hasilnya.",
  "Pikiran yang jernih dimulai dari rutinitas yang teratur.",
  "Kalahkan prokrastinasi dengan memulai dari yang paling kecil.",
  "Kamu satu keputusan jauhnya dari hidup yang berbeda.",
  "Jadwalmu mencerminkan prioritasmu — apakah kamu suka apa yang kamu lihat?",
  "Produktivitas adalah keputusan, bukan perasaan.",
  "Setiap pencapaian besar dimulai dari satu langkah pertama yang sederhana.",
  "Jangan perbandingan — kompetisimu hanya dengan dirimu kemarin.",
  "Bangun kebiasaan yang membuatmu tidak perlu bergantung pada motivasi.",
  "Waktu luang yang diisi dengan baik adalah investasi, bukan pemborosan.",
  "Jadilah orang yang menyelesaikan, bukan hanya merencanakan.",
  "Rasa malas adalah musuh terbesar mimpimu — lawan setiap hari.",
  "Satu jam di pagi hari senilai dua jam di malam hari.",
  "Kesuksesan tidak datang dari apa yang kamu lakukan sesekali, tapi dari apa yang kamu lakukan secara konsisten.",
  "Hidup yang bermakna dibangun dari hari-hari yang bermakna.",
  "Kecemasan berkurang saat kamu mulai bergerak.",
  "Setiap hari adalah halaman baru — tulislah dengan penuh makna.",
  "Disiplin diri adalah bentuk cinta tertinggi kepada dirimu sendiri.",
  "Mulai dari yang kamu bisa, tingkatkan seiring waktu.",
  "Kamu tidak akan menyesal bekerja keras — tapi akan menyesal tidak mencoba.",
  "Kerjakan satu hal dengan sepenuh hati, bukan banyak hal dengan setengah hati.",
  "Pola pikir yang benar adalah 50% dari keberhasilan.",
  "Percayai prosesnya — hasil yang baik butuh waktu dan kesabaran.",
  "Hidup yang terstruktur memberi ruang untuk hal-hal yang paling penting.",
  "Setiap detik yang berlalu tidak bisa kembali — buatnya berarti.",
  "Kamu tidak perlu menunggu semangat — semangat muncul setelah kamu mulai.",
  "Jadikan produktivitas sebagai identitasmu, bukan sekadar tujuan.",
  "Orang yang sukses tidak punya lebih banyak waktu — mereka punya lebih banyak prioritas.",
  "Dua jam fokus penuh lebih baik dari delapan jam dengan distraksi.",
  "Setiap hari baru adalah kesempatan untuk menjadi siapa yang ingin kamu jadi.",
  "Kamu sudah sampai sejauh ini — jangan berhenti sekarang.",
];
```

---

### Step 3 — Hooks & Utils

**3a. `src/hooks/useStorage.ts`:**
```typescript
import { useState } from 'react';

function useStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue] as const;
}

export default useStorage;
```

**3b. `src/utils/helpers.ts`:**
```typescript
import { DayKey } from '../types';

export const DAY_KEYS: DayKey[] = [
  'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday',
];

export const DAY_LABELS: Record<DayKey, string> = {
  monday:    'Senin',
  tuesday:   'Selasa',
  wednesday: 'Rabu',
  thursday:  'Kamis',
  friday:    'Jumat',
  saturday:  'Sabtu',
  sunday:    'Minggu',
};

export const DAY_SHORT: Record<DayKey, string> = {
  monday:    'Sen',
  tuesday:   'Sel',
  wednesday: 'Rab',
  thursday:  'Kam',
  friday:    'Jum',
  saturday:  'Sab',
  sunday:    'Min',
};

// JS getDay() returns 0=Sunday, 1=Monday, ..., 6=Saturday
const JS_DAY_TO_KEY: DayKey[] = [
  'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday',
];

export const getTodayKey = (): DayKey => {
  return JS_DAY_TO_KEY[new Date().getDay()];
};

export const getDayOfYear = (date: Date): number => {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
};

export const getCurrentTimeString = (): string => {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
};

export const formatDateIndonesia = (date: Date): string => {
  return date.toLocaleDateString('id-ID', {
    weekday: 'long',
    year:    'numeric',
    month:   'long',
    day:     'numeric',
  });
};

export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
};

// Compare "HH:MM" strings directly (works because they're zero-padded)
export const timeCompare = (a: string, b: string): number => {
  return a < b ? -1 : a > b ? 1 : 0;
};

export const getSlotStatus = (
  start: string,
  end: string,
  currentTime: string
): 'past' | 'current' | 'future' => {
  if (end <= currentTime) return 'past';
  if (start <= currentTime) return 'current';
  return 'future';
};
```

**3c. `src/data/defaultData.ts`:**
```typescript
import { AppData } from '../types';

export const DEFAULT_DATA: AppData = {
  schedule: {
    monday:    [],
    tuesday:   [],
    wednesday: [],
    thursday:  [],
    friday:    [],
    saturday:  [],
    sunday:    [],
  },
};
```

---

### Step 4 — Layout & Navigation Components

**4a. `src/components/BottomNav.tsx`:**
- 3 tab: Dashboard (icon: Home), Jadwal (icon: CalendarDays), Settings (icon: Settings) — pakai lucide-react
- Active tab: text + icon warna `ocean-blue`, background `mist`, border top biru
- Inactive tab: warna `slate-400`
- Bottom nav fixed di bawah, `bg-white border-t border-mist`
- Gunakan `useLocation` dari react-router-dom untuk cek active route

**4b. `src/components/Layout.tsx`:**
- Wrapper: `min-h-screen bg-cloud-white font-sans`
- Content area: `pb-20` (padding bottom untuk bottom nav)
- Render `{children}` lalu `<BottomNav />`

---

### Step 5 — Dashboard Page (`src/pages/Dashboard.tsx`)

**Struktur UI (dari atas ke bawah):**

1. **Header** — gradient `from-deep-navy to-ocean-blue`, padding atas cukup besar
   - Teks kecil: "Hari ini"
   - Tanggal lengkap Indonesia: e.g. "Selasa, 24 Juni 2026"
   - Hari dalam bahasa Indonesia (Senin–Minggu)

2. **Card Motivasi** — card putih, margin horizontal, shadow ringan, border `mist`
   - Icon tanda petik (lucide: `Quote`) warna `sky-tint`
   - Teks motivasi hari ini (diambil dari array motivations dengan index = `getDayOfYear(today) % 100`)

3. **Jadwal Hari Ini** — section dengan judul "Jadwal Hari Ini"
   - Ambil slots dari `schedule[todayKey]`, sort by `start` time
   - **Jika tidak ada slot:** tampilkan empty state dengan icon CalendarX2, teks "Belum ada jadwal untuk hari ini", link ke `/schedule`
   - **Jika ada slot:** list card per slot dengan warna berbeda berdasarkan waktu:
     - **Past** (end <= now): `bg-slate-100 border-slate-200`, teks `text-slate-400`, jam `text-slate-400` — redup/muted
     - **Current** (start <= now < end): `bg-blue-50 border-sky-tint`, badge "Sekarang" warna `ocean-blue`, teks normal bold
     - **Future** (start > now): `bg-white border-mist`, teks `text-deep-navy`, jam `text-ocean-blue`
   - Setiap card slot tampilkan: rentang jam (e.g. "08:00 – 09:30") dan nama aktivitas (atau "—" jika kosong)
   - Update warna otomatis setiap menit: gunakan `useEffect` + `setInterval(1000 * 60)` untuk re-render

**Logic update waktu:**
```typescript
const [currentTime, setCurrentTime] = useState(getCurrentTimeString());
useEffect(() => {
  const interval = setInterval(() => {
    setCurrentTime(getCurrentTimeString());
  }, 60_000);
  return () => clearInterval(interval);
}, []);
```

---

### Step 6 — Schedule Page (`src/pages/Schedule.tsx`)

**Struktur UI:**

1. **Header** — gradient `from-deep-navy to-ocean-blue`
   - Judul: "Atur Jadwal"
   - Subtitle: "Kelola jadwal mingguan kamu"

2. **Day Tabs** — horizontal scroll row, 7 tab (Sen–Min)
   - Active: `bg-ocean-blue text-white rounded-xl`
   - Inactive: `bg-white text-slate-500 border border-mist rounded-xl`
   - Klik tab → ganti `selectedDay` state

3. **Tombol "Copy dari hari lain"** — di bawah tabs
   - Icon: Copy (lucide)
   - Warna: secondary, `border border-sky-tint text-ocean-blue`
   - Klik → buka modal pilih hari sumber

4. **List Slot** — list card per slot (sorted by start time)
   - Setiap card tampilkan: jam mulai–selesai, nama aktivitas
   - Di kanan setiap card: tombol Edit (icon Pencil) dan Delete (icon Trash2)
   - **Empty state:** jika tidak ada slot, tampilkan pesan "Belum ada jadwal untuk hari ini"

5. **Tombol "+ Tambah Slot"** — FAB atau button di bagian bawah (fixed atau di bawah list)
   - Warna: `bg-ocean-blue text-white`

**Modal Tambah/Edit Slot:**
- Judul: "Tambah Slot" / "Edit Slot"
- Fields:
  - **Jam Mulai** (`<input type="time" />`) — required
  - **Jam Selesai** (`<input type="time" />`) — required, harus > jam mulai
  - **Aktivitas** (`<input type="text" placeholder="Aktivitas (opsional)" />`) — optional
- Validasi: end > start (tampilkan pesan error merah jika tidak)
- Tombol: "Simpan" (`bg-ocean-blue`) dan "Batal" (`border border-slate-300`)
- Modal overlay: `bg-black/40 backdrop-blur-sm`

**Modal Copy dari Hari Lain:**
- Judul: "Copy Jadwal Dari"
- List 7 hari (kecuali hari yang sedang dipilih)
- Klik salah satu → konfirmasi "Ganti jadwal [hari ini] dengan jadwal [hari sumber]?"
- Jika confirm → replace semua slot di selectedDay dengan slot dari hari sumber (buat ulang ID baru)

**Delete Slot:**
- Konfirmasi inline atau mini-modal: "Hapus slot ini?" dengan tombol "Hapus" merah dan "Batal"

---

### Step 7 — Settings Page (`src/pages/Settings.tsx`)

**Struktur UI (card-card vertikal):**

1. **Header** — gradient `from-deep-navy to-ocean-blue`
   - Judul: "Settings"

2. **Card: Data Management**
   - **Export JSON**: tombol dengan icon Download, download file `habbit-tracker-backup.json`
     ```typescript
     const json = JSON.stringify(data, null, 2);
     const blob = new Blob([json], { type: 'application/json' });
     const url = URL.createObjectURL(blob);
     const a = document.createElement('a');
     a.href = url; a.download = 'habbit-tracker-backup.json'; a.click();
     URL.revokeObjectURL(url);
     ```
   - **Import JSON**: tombol dengan icon Upload → trigger `<input type="file" accept=".json" />`
     - Parse JSON, validasi struktur ada key `schedule`, simpan ke storage
     - Tampilkan toast sukses/error
   - **Export PDF**: tombol dengan icon FileText
     - Generate PDF jadwal mingguan menggunakan `jsPDF` + `jspdf-autotable`
     - Format: judul "Jadwal Mingguan — Habbit Tracker", tanggal export, tabel per hari
     - Setiap hari sebagai section, kolom: Jam Mulai | Jam Selesai | Aktivitas
   - **Hapus Semua Data**: tombol merah dengan icon Trash2
     - Konfirmasi modal sebelum hapus: "Yakin ingin menghapus semua data? Aksi ini tidak bisa dibatalkan."
     - Jika confirm → reset ke DEFAULT_DATA

3. **Card: Support Developer**
   - Judul: "Support Developer ☕"
   - Teks kecil: "Aplikasi ini gratis. Jika bermanfaat, kamu bisa support dengan scan QRIS di bawah ini."
   - **Placeholder QRIS image**: `<img src="/qris.png" alt="QRIS" className="w-48 h-48 mx-auto object-contain rounded-xl border border-mist" />`
     - Simpan gambar QRIS di `public/qris.png`
   - **Tombol Download QRIS**: icon Download, warna `ocean-blue`
     ```typescript
     const a = document.createElement('a');
     a.href = '/qris.png'; a.download = 'QRIS-HabbitTracker.png'; a.click();
     ```

4. **Card: Feedback & Bug Report**
   - Teks: "Ada saran fitur atau menemukan bug?"
   - Tombol/link ke WhatsApp: `https://wa.me/6281212834013`
   - Buka di tab baru: `target="_blank" rel="noopener noreferrer"`
   - Icon: MessageCircle (lucide)
   - Warna tombol: `bg-green-500 hover:bg-green-600 text-white`

5. **Footer kecil** di bagian bawah card:
   - "Habbit Tracker v1.0.0 — Made with ❤️"

---

### Step 8 — PDF Export Detail (jspdf-autotable)

```typescript
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { DAY_KEYS, DAY_LABELS } from '../utils/helpers';
import { ScheduleData } from '../types';

export const exportToPDF = (schedule: ScheduleData) => {
  const doc = new jsPDF();
  
  doc.setFontSize(18);
  doc.setTextColor(10, 37, 64); // deep-navy
  doc.text('Jadwal Mingguan — Habbit Tracker', 14, 20);
  
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139); // slate-500
  doc.text(`Diekspor pada: ${new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`, 14, 28);

  let startY = 36;

  DAY_KEYS.forEach((day) => {
    const slots = [...schedule[day]].sort((a, b) => a.start.localeCompare(b.start));
    
    doc.setFontSize(12);
    doc.setTextColor(27, 108, 168); // ocean-blue
    doc.text(DAY_LABELS[day], 14, startY);
    startY += 4;

    if (slots.length === 0) {
      autoTable(doc, {
        startY,
        body: [['—', '—', 'Tidak ada jadwal']],
        columns: [{ header: 'Jam Mulai' }, { header: 'Jam Selesai' }, { header: 'Aktivitas' }],
        headStyles: { fillColor: [27, 108, 168] },
        styles: { fontSize: 9 },
        margin: { left: 14, right: 14 },
      });
    } else {
      autoTable(doc, {
        startY,
        body: slots.map(s => [s.start, s.end, s.activity || '—']),
        columns: [{ header: 'Jam Mulai' }, { header: 'Jam Selesai' }, { header: 'Aktivitas' }],
        headStyles: { fillColor: [27, 108, 168] },
        styles: { fontSize: 9 },
        margin: { left: 14, right: 14 },
      });
    }

    startY = (doc as any).lastAutoTable.finalY + 10;
  });

  doc.save('jadwal-habbit-tracker.pdf');
};
```

---

## File Structure Lengkap

```
habbit-tracker/
├── public/
│   └── qris.png              ← TARUH GAMBAR QRIS DI SINI
├── src/
│   ├── components/
│   │   ├── Layout.tsx
│   │   └── BottomNav.tsx
│   ├── data/
│   │   ├── motivations.ts
│   │   └── defaultData.ts
│   ├── hooks/
│   │   └── useStorage.ts
│   ├── pages/
│   │   ├── Dashboard.tsx
│   │   ├── Schedule.tsx
│   │   └── Settings.tsx
│   ├── types/
│   │   └── index.ts
│   ├── utils/
│   │   ├── helpers.ts
│   │   └── pdfExport.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── index.html
├── tailwind.config.js
├── postcss.config.js
├── tsconfig.json
└── vite.config.ts
```

---

## Catatan Penting

- **QRIS image**: Simpan gambar QRIS di `public/qris.png`. Jika belum ada, buat placeholder `<div>` dengan teks "QRIS akan segera hadir" sampai gambar tersedia.
- **LocalStorage key**: `habbit-tracker-data`
- **Mobile-first**: Semua layout prioritas mobile, max-width sekitar `max-w-md mx-auto` untuk konten utama
- **Font**: Inter dari Google Fonts, sudah di-load di `index.html`
- **Tidak ada autentikasi** — aplikasi langsung bisa dipakai
- **Tidak ada backend** — semua data di LocalStorage

---

## Summary Urutan Build

| #  | Step                      | File yang dibuat/diubah                                          |
|----|---------------------------|------------------------------------------------------------------|
| 1  | Config & Base Setup       | `tailwind.config.js`, `index.html`, `index.css`, `main.tsx`, `App.tsx` |
| 2  | Types & Data              | `src/types/index.ts`, `src/data/motivations.ts`, `src/data/defaultData.ts` |
| 3  | Hooks & Utils             | `src/hooks/useStorage.ts`, `src/utils/helpers.ts`, `src/utils/pdfExport.ts` |
| 4  | Layout & Nav              | `src/components/Layout.tsx`, `src/components/BottomNav.tsx`      |
| 5  | Dashboard Page            | `src/pages/Dashboard.tsx`                                        |
| 6  | Schedule Page             | `src/pages/Schedule.tsx`                                         |
| 7  | Settings Page             | `src/pages/Settings.tsx`                                         |
| 8  | Test & Polish             | Cek semua fitur, pastikan responsive, cek edge case empty state  |
