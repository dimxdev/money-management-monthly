import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { BudgetProvider, useBudgetContext } from './context/BudgetContext'
import { DarkModeProvider } from './context/DarkModeContext'
import { ToastProvider } from './context/ToastContext'
import { Sidebar } from './components/layout/Sidebar'
import { BottomNav } from './components/layout/BottomNav'

// Lazy load tiap halaman → tiap route jadi chunk terpisah,
// user hanya download halaman yang dibuka (hemat kuota).
const Dashboard = lazy(() => import('./pages/Dashboard'))
const BudgetSetup = lazy(() => import('./pages/BudgetSetup'))
const AddExpense = lazy(() => import('./pages/AddExpense'))
const AddIncome = lazy(() => import('./pages/AddIncome'))
const CategoryDetail = lazy(() => import('./pages/CategoryDetail'))
const History = lazy(() => import('./pages/History'))
const Notes = lazy(() => import('./pages/Notes'))
const Analytics = lazy(() => import('./pages/Analytics'))
const Settings = lazy(() => import('./pages/Settings'))

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="h-8 w-8 rounded-full border-2 border-slate-200 border-t-violet-500 animate-spin" />
    </div>
  )
}

function ProtectedRoute({ children }) {
  const { activeMonth } = useBudgetContext()
  return activeMonth ? children : <Navigate to="/setup" replace />
}

function AppRoutes() {
  return (
    <>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/setup" element={<BudgetSetup />} />
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/add" element={<ProtectedRoute><AddExpense /></ProtectedRoute>} />
          <Route path="/income" element={<ProtectedRoute><AddIncome /></ProtectedRoute>} />
          <Route path="/category/:id" element={<ProtectedRoute><CategoryDetail /></ProtectedRoute>} />
          <Route path="/history" element={<History />} />
          <Route path="/history/:monthId" element={<History />} />
          <Route path="/history/:monthId/category/:id" element={<CategoryDetail />} />
          <Route path="/notes" element={<Notes />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
      <BottomNav />
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <DarkModeProvider>
      <ToastProvider>
      <BudgetProvider>
        {/* Sidebar — fixed, hanya muncul di desktop (lg+) */}
        <Sidebar />
        {/* Konten utama — di desktop digeser ke kanan sejauh lebar sidebar */}
        <div className="lg:pl-60">
          <AppRoutes />
        </div>
      </BudgetProvider>
      </ToastProvider>
      </DarkModeProvider>
    </BrowserRouter>
  )
}
