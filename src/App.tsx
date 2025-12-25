import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Outlet, useParams, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { userApi } from "@/services/api";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { SettingsProvider } from "@/context/SettingsContext";
import { RestaurantProvider, useRestaurant } from "@/context/RestaurantContext";

// Platform Pages
import PlatformLanding from "./pages/PlatformLanding";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import Onboarding from "./pages/admin/Onboarding";

// Admin Components
import { DashboardHome } from '@/components/admin/DashboardHome';
import { OrdersPage } from '@/components/admin/OrdersPage';
import { MenuPage } from '@/components/admin/MenuPage';
import { ReservationsPage } from '@/components/admin/ReservationsPage';
import { CustomersPage } from '@/components/admin/CustomersPage';
import { AnalyticsPage } from '@/components/admin/AnalyticsPage';
import { SettingsPage } from '@/components/admin/SettingsPage';
import { WebsiteBuilder } from '@/components/admin/WebsiteBuilder';
import { QRCodesPage } from '@/components/admin/QRCodesPage';
import { NotificationsPage } from '@/components/admin/NotificationsPage';
import { CustomerQueriesPage } from '@/components/admin/CustomerQueriesPage';
import { AboutContentPage } from '@/components/admin/AboutContentPage';
import { TablesPage } from '@/components/admin/TablesPage';

// User Pages (Tenant)
import Index from "./pages/Index";
import Menu from "./pages/Menu";
import Checkout from "./pages/Checkout";
import OrderConfirmation from "./pages/OrderConfirmation";
import Orders from "./pages/Orders";
import Contact from "./pages/Contact";
import About from "./pages/About";
import Profile from "./pages/Profile";
import QRMenu from "./pages/QRMenu";
import Reservations from "./pages/Reservations";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Layout wrapper that ensures a restaurant is loaded for tenant routes
const TenantLayout = () => {
  const { user, isAuthenticated } = useAuth();
  const { restaurant, isLoading, error } = useRestaurant();
  const { slug } = useParams();

  // Register visit for authenticated users
  useEffect(() => {
    if (isAuthenticated && user && restaurant?.id && !restaurant?.settings?.primaryColor?.includes(user?.id)) {
      userApi.registerVisit(restaurant.id).catch(err => console.error("Failed to register visit", err));
    }
  }, [isAuthenticated, user?.id, restaurant?.id]);

  if (isLoading) return <div className="h-screen flex items-center justify-center">Loading Restaurant...</div>;
  if (error || !restaurant || restaurant.slug !== slug) {
    // Could redirect to 404 or Platform Home
    console.warn("Tenant mismatch or not found", error);
    return <div className="h-screen flex items-center justify-center">Restaurant Not Found</div>;
  }

  // Helper to convert Hex to HSL for Tailwind
  const hexToHSL = (hex: string): string => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return '0 0% 0%'; // Fallback black

    let r = parseInt(result[1], 16);
    let g = parseInt(result[2], 16);
    let b = parseInt(result[3], 16);

    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }

    // Tailwind expects space separated values without commas
    return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
  };

  return (
    <div style={{
      '--primary': hexToHSL(restaurant.settings?.primaryColor || '#000000'),
      '--primary-foreground': '#ffffff',
      '--secondary': hexToHSL(restaurant.settings?.secondaryColor || '#ffffff'),
      '--secondary-foreground': '#000000',
    } as React.CSSProperties}>
      <Outlet />
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <SettingsProvider>
      <AuthProvider>
        <RestaurantProvider>
          <CartProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Routes>
                  {/* --- Platform Routes --- */}
                  <Route path="/" element={<PlatformLanding />} />
                  <Route path="/login" element={<Navigate to="/admin/login" replace />} />
                  <Route path="/register" element={<AdminLogin />} />
                  <Route path="/signup" element={<AdminLogin />} />

                  {/* --- Admin Routes --- */}
                  <Route path="/admin/login" element={<AdminLogin />} />
                  <Route path="/admin/onboarding" element={<Onboarding />} />

                  <Route path="/admin" element={<AdminDashboard />}>
                    <Route index element={<DashboardHome />} />
                    <Route path="orders" element={<OrdersPage />} />
                    <Route path="menu" element={<MenuPage />} />
                    <Route path="reservations" element={<ReservationsPage />} />
                    <Route path="customers" element={<CustomersPage />} />
                    <Route path="analytics" element={<AnalyticsPage />} />
                    <Route path="settings" element={<SettingsPage />} />
                    <Route path="website-builder" element={<WebsiteBuilder />} />
                    <Route path="qr-codes" element={<QRCodesPage />} />
                    <Route path="notifications" element={<NotificationsPage />} />
                    <Route path="queries" element={<CustomerQueriesPage />} />
                    <Route path="about-content" element={<AboutContentPage />} />
                    <Route path="tables" element={<TablesPage />} />
                  </Route>

                  {/* --- Tenant Routes (/:slug) --- */}
                  <Route path="/:slug" element={<TenantLayout />}>
                    <Route index element={<Index />} />
                    <Route path="menu" element={<Menu />} />
                    <Route path="checkout" element={<Checkout />} />
                    <Route path="order-confirmation/:orderId" element={<OrderConfirmation />} />
                    <Route path="orders" element={<Orders />} />
                    <Route path="profile" element={<Profile />} />
                    <Route path="contact" element={<Contact />} />
                    <Route path="about" element={<About />} />
                    <Route path="qr-menu" element={<QRMenu />} />
                    <Route path="reservations" element={<Reservations />} />
                  </Route>

                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </TooltipProvider>
          </CartProvider>
        </RestaurantProvider>
      </AuthProvider>
    </SettingsProvider>
  </QueryClientProvider>
);

export default App;
