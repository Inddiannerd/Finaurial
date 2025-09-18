import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import './App.css';
import './index.css';
import ErrorBoundary from './components/ErrorBoundary';
import Layout from './components/Layout';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';
import { NotificationProvider } from './context/NotificationContext';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CurrencyProvider } from './context/CurrencyContext';
import { FeatureProvider } from './context/FeatureContext';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ReportsPage from './pages/ReportsPage';
import SavingsPage from './pages/SavingsPage';
import GoalsPage from './pages/GoalsPage';
import AdminPage from './pages/AdminPage';
import TransactionsPage from './pages/TransactionsPage';
import BudgetsPage from './pages/BudgetsPage';
import ContactUsPage from './pages/ContactUsPage';
import NotFound from './pages/NotFound';

// A layout for protected routes
const ProtectedLayout = () => (
  <PrivateRoute>
    <Layout>
      <Outlet />
    </Layout>
  </PrivateRoute>
);

// A layout for admin routes
const AdminLayout = () => (
  <AdminRoute>
    <Layout>
      <Outlet />
    </Layout>
  </AdminRoute>
);

const AppRoutes = () => {
  const { token } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route path="/" element={token ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />} />

      {/* Protected Routes with Layout */}
      <Route element={<ProtectedLayout />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/transactions" element={<TransactionsPage />} />
        <Route path="/budgets" element={<BudgetsPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/savings" element={<SavingsPage />} />
        <Route path="/goals" element={<GoalsPage />} />
        <Route path="/contact-us" element={<ContactUsPage />} />
      </Route>

      {/* Admin Route with Layout */}
      <Route element={<AdminLayout />}>
        <Route path="/admin" element={<AdminPage />} />
      </Route>
      
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ThemeProvider>
          <NotificationProvider>
            <CurrencyProvider>
              <FeatureProvider>
                <AppRoutes />
              </FeatureProvider>
            </CurrencyProvider>
          </NotificationProvider>
        </ThemeProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;