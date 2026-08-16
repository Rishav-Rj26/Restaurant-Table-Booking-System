import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';

// Auth Pages
import LoginPage from './features/auth/LoginPage';
import RegisterPage from './features/auth/RegisterPage';

// Diner Pages
import SearchPage from './features/search/SearchPage';
import RestaurantDetailPage from './features/booking/RestaurantDetailPage';
import CheckoutPage from './features/booking/CheckoutPage';
import ConfirmationPage from './features/booking/ConfirmationPage';
import MyBookingsPage from './features/booking/MyBookingsPage';
import AboutPage from './features/about/AboutPage';

// Dashboard Pages
import DashboardLayout from './features/dashboard/DashboardLayout';
import DashboardHomePage from './features/dashboard/DashboardHomePage';
import BookingsListPage from './features/dashboard/BookingsListPage';
import TableManagementPage from './features/dashboard/TableManagementPage';
import AnalyticsPage from './features/dashboard/AnalyticsPage';
import OnboardingPage from './features/dashboard/OnboardingPage';

// Check-in Pages
import CheckinLayout from './features/checkin/CheckinLayout';
import CheckinHomePage from './features/checkin/CheckinHomePage';
import ScannerPage from './features/checkin/ScannerPage';
import ManualEntryPage from './features/checkin/ManualEntryPage';
import NoShowListPage from './features/checkin/NoShowListPage';

// Basic layouts for diner
const DinerLayout = () => (
  <div className="min-h-screen flex flex-col bg-background">
    {/* Nav would go here */}
    <main className="flex-1">
      <Outlet />
    </main>
  </div>
);

// Protected Route wrappers
const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode, allowedRoles?: string[] }) => {
  const { isAuthenticated, user } = useAuth();
  
  if (!isAuthenticated) return <Navigate to="/auth/login" replace />;
  if (allowedRoles && user && !allowedRoles.includes(user.role)) return <Navigate to="/" replace />;
  
  return <>{children}</>;
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth Routes */}
        <Route path="/auth/login" element={<LoginPage />} />
        <Route path="/auth/register" element={<RegisterPage />} />
        
        {/* Diner Routes */}
        <Route path="/" element={<DinerLayout />}>
          <Route index element={<SearchPage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="restaurant/:id" element={<RestaurantDetailPage />} />
          <Route 
            path="checkout" 
            element={
              <ProtectedRoute allowedRoles={['user']}>
                <CheckoutPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="confirmation/:id" 
            element={
              <ProtectedRoute allowedRoles={['user']}>
                <ConfirmationPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="my-bookings" 
            element={
              <ProtectedRoute allowedRoles={['user']}>
                <MyBookingsPage />
              </ProtectedRoute>
            } 
          />
        </Route>
        
        {/* Dashboard Routes */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute allowedRoles={['owner', 'manager']}>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardHomePage />} />
          <Route path="bookings" element={<BookingsListPage />} />
          <Route path="tables" element={<TableManagementPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="onboarding" element={<OnboardingPage />} />
        </Route>
        
        {/* Staff Check-in Routes */}
        <Route 
          path="/staff" 
          element={
            <ProtectedRoute allowedRoles={['owner', 'manager', 'host']}>
              <CheckinLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<CheckinHomePage />} />
          <Route path="scanner" element={<ScannerPage />} />
          <Route path="manual-entry" element={<ManualEntryPage />} />
          <Route path="no-shows" element={<NoShowListPage />} />
        </Route>
        
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
