import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Polyfill for simple-peer and other Node.js globals
if (typeof window !== 'undefined') {
  // Define global if it doesn't exist
  if (!window.global) {
    window.global = window;
  }
  
  // Define globalThis if it doesn't exist
  if (!window.globalThis) {
    window.globalThis = window;
  }
  
  // Define process if it doesn't exist
  if (!window.process) {
    window.process = { env: {} };
  }
  
  // Define Buffer if it doesn't exist
  if (typeof window.Buffer === 'undefined') {
    window.Buffer = {
      isBuffer: function() { return false; }
    };
  }
}
import Menu from './pages/Menu';
import Cart from './store/Cart';
import { CartContextProvider } from './context/CartContext';
import { IpContextProvider } from './context/IpContext';
import { AuthProvider } from './context/AuthContext';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import KitchenScreen from './pages/KitchenScreen';
import AdminKitchenScreen from './pages/AdminKitchenScreen';
import KitchenStaffDashboard from './pages/KitchenStaffDashboard';
import AdminKitchenDashboard from './pages/AdminKitchenDashboard';
import AdminWaiterDashboard from './pages/AdminWaiterDashboard';
import AdminWaiterScreen from './pages/AdminWaiterScreen';
import WaiterDashboard from './pages/WaiterDashboard';
import WaiterScreen from './pages/WaiterScreen';
import AdminRegister from './pages/AdminRegister';
import AdminControlPanel from './pages/AdminControlPanel';
import AdminAnalytics from './pages/AdminAnalytics';
import AIWaiter from './pages/AIWaiter';
import FeedbackForm from './pages/FeedbackForm';
import Receipt from './pages/Receipt';
import ContactPage from './pages/ContactPage';
import LoginForm from './components/EnhancedLoginForm'; // Updated to use enhanced login form
import RegisterForm from './components/EnhancedRegisterForm'; // Updated to use enhanced register form
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import UserProfile from './pages/UserProfile';
import OrderHistory from './pages/EnhancedOrderHistory';
import OrderTracking from './pages/OrderTracking';
import InventoryManagement from './pages/InventoryManagement';
import AllergenManagement from './pages/AllergenManagement';
import PromotionManagement from './pages/PromotionManagement';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';
import OrderConfirmation from './pages/EnhancedOrderConfirmation'; // Import the enhanced component

// Global error handler
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
  // Send to logging service if needed
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
  // Send to logging service if needed
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <IpContextProvider>
          <AuthProvider>
            <CartContextProvider>
              <Routes>
                {/* Authentication Routes */}
                <Route path="/login" element={<LoginForm />} />
                <Route path="/register" element={<RegisterForm />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                
                {/* User Routes */}
                <Route path="/" element={<Menu />} />
                <Route path="/menu" element={<Menu />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/feedback" element={<FeedbackForm />} />
                <Route path="/receipt" element={<Receipt />} />
                <Route path="/aiwaiter" element={<AIWaiter />} />
                <Route path="/order-confirmation" element={<OrderConfirmation />} /> {/* Add the new route */}
                <Route path="/contact" element={<ContactPage />} />
                
                {/* Protected User Routes */}
                <Route path="/profile" element={
                  <ProtectedRoute>
                    <UserProfile />
                  </ProtectedRoute>
                } />
                <Route path="/orders" element={
                  <ProtectedRoute>
                    <OrderHistory />
                  </ProtectedRoute>
                } />
                <Route path="/order-tracking/:orderId" element={
                  <ProtectedRoute>
                    <OrderTracking />
                  </ProtectedRoute>
                } />
                {/* Admin Routes */}
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin/register" element={<AdminRegister />} />
                <Route path="/admin/dashboard" element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                } />
                <Route path="/admin/control-panel" element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminControlPanel />
                  </ProtectedRoute>
                } />
                <Route path="/admin/analytics" element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminAnalytics />
                  </ProtectedRoute>
                } />
                <Route path="/admin/inventory" element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <InventoryManagement />
                  </ProtectedRoute>
                } />
                <Route path="/admin/allergen-management" element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AllergenManagement />
                  </ProtectedRoute>
                } />
                <Route path="/admin/promotions" element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <PromotionManagement />
                  </ProtectedRoute>
                } />
                <Route path="/admin/kitchen-dashboard" element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminKitchenDashboard />
                  </ProtectedRoute>
                } />
                {/* Kitchen Staff Routes */}
                <Route path="/staff/dashboard" element={
                  <ProtectedRoute allowedRoles={['kitchen_staff', 'admin']}>
                    <KitchenStaffDashboard />
                  </ProtectedRoute>
                } />
                <Route path="/staff/kitchen" element={
                  <ProtectedRoute allowedRoles={['kitchen_staff', 'admin']}>
                    <KitchenStaffDashboard />
                  </ProtectedRoute>
                } />
                <Route path="/staff/screen" element={
                  <ProtectedRoute allowedRoles={['kitchen_staff']}>
                    <KitchenScreen />
                  </ProtectedRoute>
                } />
                <Route path="/admin/kitchen" element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminKitchenScreen />
                  </ProtectedRoute>
                } />
                <Route path="/admin/waiter-dashboard" element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminWaiterDashboard />
                  </ProtectedRoute>
                } />
                <Route path="/admin/waiter-screen" element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminWaiterScreen />
                  </ProtectedRoute>
                } />
                <Route path="/staff/waiter-dashboard" element={
                  <ProtectedRoute allowedRoles={['waiter', 'admin']}>
                    <WaiterDashboard />
                  </ProtectedRoute>
                } />
                <Route path="/staff/waiter" element={
                  <ProtectedRoute allowedRoles={['waiter', 'admin']}>
                    <WaiterScreen />
                  </ProtectedRoute>
                } />
              </Routes>
            </CartContextProvider>
          </AuthProvider>
        </IpContextProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>,
);