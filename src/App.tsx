import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Welcome } from './pages/Welcome';
import { Home } from './pages/Home';
import { About } from './pages/About';
import { Contact } from './pages/Contact';
import { Login, Register, ForgotPassword, ResetPassword, Profile } from './auth';
import { ProtectedRoute, PublicRoute } from './routes/ProtectedRoute';

// Dashboard imports
import { DashboardLayout } from './layouts/DashboardLayout';
import { DashboardCompanySelect } from './pages/DashboardCompanySelect';
import { DashboardHome } from './pages/DashboardHome';
import { EditCompanyPage } from './features/company';
import { CompanyUsersPage } from './features/companyUsers';
import { PartyPage } from './features/parties';
import { TradeListPage, CreateTradePage, TradeDetailsPage, EditTradePage } from './features/trades';
import { InvoiceListPage, InvoiceCreatePage, InvoiceDetailPage, InvoiceEditPage } from './features/invoices';
import { ForexDashboardPage, ForexUsagePage } from './features/forex';
import { ExposureDashboard, ExposureListPage, ExposureDetailPage, HedgeManagementPage, QuarterlyReportView } from './features/exposure';
import { PaymentsPage, SettingsPage } from './pages/DashboardPlaceholders';
import { ActionBarProvider } from './components/ui/BottomActionBar';

function App() {
  return (
    <BrowserRouter>
      <ActionBarProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Welcome />} />
          <Route path="/home" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />

          {/* Auth Routes (redirect to dashboard if already logged in) */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            }
          />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Protected Routes */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          {/* Dashboard - Company Selection (before entering main dashboard) */}
          <Route
            path="/dashboard/select-company"
            element={
              <ProtectedRoute>
                <DashboardCompanySelect />
              </ProtectedRoute>
            }
          />

          {/* Dashboard Routes (Protected + Requires Company) */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardHome />} />
            <Route path="trades" element={<TradeListPage />} />
            <Route path="trades/create" element={<CreateTradePage />} />
            <Route path="trades/:id" element={<TradeDetailsPage />} />
            <Route path="trades/:id/edit" element={<EditTradePage />} />
            <Route path="invoices" element={<InvoiceListPage />} />
            <Route path="invoices/new" element={<InvoiceCreatePage />} />
            <Route path="invoices/:id" element={<InvoiceDetailPage />} />
            <Route path="invoices/:id/edit" element={<InvoiceEditPage />} />
            
            {/* Exposure Module - Treasury & Risk Management */}
            <Route path="exposures" element={<ExposureDashboard />} />
            <Route path="exposures/list" element={<ExposureListPage />} />
            <Route path="exposures/hedges" element={<HedgeManagementPage />} />
            <Route path="exposures/quarterly-report" element={<QuarterlyReportView />} />
            <Route path="exposures/:id" element={<ExposureDetailPage />} />
            {/* Legacy route redirect */}
            <Route path="exposure" element={<Navigate to="/dashboard/exposures" replace />} />
            
            <Route path="payments" element={<PaymentsPage />} />
            <Route path="parties" element={<PartyPage />} />
            <Route path="settings" element={<SettingsPage />} />
            
            {/* Forex Module - Read-only market data */}
            <Route path="forex" element={<ForexDashboardPage />} />
            <Route path="forex/usage" element={<ForexUsagePage />} />
            
            {/* Company Management (Admin only - enforced in components) */}
            <Route path="company/edit" element={<EditCompanyPage />} />
            <Route path="company/users" element={<CompanyUsersPage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </ActionBarProvider>
    </BrowserRouter>
  );
}

export default App;
