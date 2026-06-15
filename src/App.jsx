import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { BudgetProvider, useBudgetContext } from './context/BudgetContext'
import { DarkModeProvider } from './context/DarkModeContext'
import { Sidebar } from './components/layout/Sidebar'
import { BottomNav } from './components/layout/BottomNav'
import Dashboard from './pages/Dashboard'
import BudgetSetup from './pages/BudgetSetup'
import AddExpense from './pages/AddExpense'
import AddIncome from './pages/AddIncome'
import CategoryDetail from './pages/CategoryDetail'
import History from './pages/History'
import Settings from './pages/Settings'

function ProtectedRoute({ children }) {
  const { activeMonth } = useBudgetContext()
  return activeMonth ? children : <Navigate to="/setup" replace />
}

function AppRoutes() {
  return (
    <>
      <Routes>
        <Route path="/setup" element={<BudgetSetup />} />
        <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/add" element={<ProtectedRoute><AddExpense /></ProtectedRoute>} />
        <Route path="/income" element={<ProtectedRoute><AddIncome /></ProtectedRoute>} />
        <Route path="/category/:id" element={<ProtectedRoute><CategoryDetail /></ProtectedRoute>} />
        <Route path="/history" element={<History />} />
        <Route path="/history/:monthId" element={<History />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <BottomNav />
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <DarkModeProvider>
      <BudgetProvider>
        {/* Sidebar — fixed, hanya muncul di desktop (lg+) */}
        <Sidebar />
        {/* Konten utama — di desktop digeser ke kanan sejauh lebar sidebar */}
        <div className="lg:pl-60">
          <AppRoutes />
        </div>
      </BudgetProvider>
      </DarkModeProvider>
    </BrowserRouter>
  )
}
