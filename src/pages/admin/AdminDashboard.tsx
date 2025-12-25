import { useState, useEffect } from 'react';
import { Link, useLocation, Navigate, useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { restaurantApi } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Plus, ChevronDown, Check } from 'lucide-react';
import {
  LayoutDashboard, ShoppingCart, UtensilsCrossed, Users, Settings,
  BarChart3, CalendarDays, LogOut, Menu, Palette, QrCode, MessageSquare, FileText,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { AdminContext } from '@/context/AdminContext';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
  { icon: ShoppingCart, label: 'Orders', path: '/admin/orders' },
  { icon: UtensilsCrossed, label: 'Menu', path: '/admin/menu' },
  { icon: CalendarDays, label: 'Reservations', path: '/admin/reservations' },
  { icon: Users, label: 'Customers', path: '/admin/customers' },
  { icon: BarChart3, label: 'Analytics', path: '/admin/analytics' },
  { icon: MessageSquare, label: 'Queries', path: '/admin/queries' },
  { icon: QrCode, label: 'QR Codes', path: '/admin/qr-codes' },
  { icon: Palette, label: 'Website', path: '/admin/website-builder' },
  { icon: FileText, label: 'Content', path: '/admin/about-content' },
  { icon: UtensilsCrossed, label: 'Tables', path: '/admin/tables' },
  { icon: Settings, label: 'Settings', path: '/admin/settings' },
];

export default function AdminDashboard() {
  const { user, logout, isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [currentRestaurant, setCurrentRestaurant] = useState<any>(null);
  const [loadingRestaurants, setLoadingRestaurants] = useState(true);

  // Fetch user's restaurants on mount
  useEffect(() => {
    if (isAuthenticated) {
      fetchRestaurants();
    }
  }, [isAuthenticated]);

  const fetchRestaurants = async () => {
    try {
      setRestaurants([]);
      setLoadingRestaurants(true);
      const res = await restaurantApi.getMyRestaurants();
      setRestaurants(res.data.data);
      // Default to first one if not set
      if (res.data.data.length > 0 && !currentRestaurant) {
        setCurrentRestaurant(res.data.data[0]);
      }
    } catch (error) {
      console.error("Failed to fetch restaurants", error);
    } finally {
      setLoadingRestaurants(false);
    }
  };

  if (!isAuthenticated) return <Navigate to="/admin/login" replace />;

  const isActive = (path: string) => {
    if (path === '/admin') return location.pathname === '/admin';
    return location.pathname.startsWith(path);
  };

  if (loadingRestaurants) {
    return <div className="h-screen w-full flex items-center justify-center"><Loader2 className="animate-spin" /></div>;
  }

  const showEmptyState = restaurants.length === 0;

  return (
    <div className="min-h-screen bg-muted/30 flex">
      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-card border-r transform transition-transform duration-200 lg:translate-x-0 lg:static",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          {/* Restaurant Switcher */}
          <div className="p-4 border-b">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full justify-between px-2">
                  <div className="flex items-center gap-2 truncate">
                    <div className="w-6 h-6 rounded bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">
                      {currentRestaurant?.name?.[0] || 'R'}
                    </div>
                    <span className="truncate">{currentRestaurant?.name || 'Select Restaurant'}</span>
                  </div>
                  <ChevronDown className="w-4 h-4 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <DropdownMenuLabel>My Restaurants</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {restaurants.map(r => (
                  <DropdownMenuItem key={r.id} onClick={() => setCurrentRestaurant(r)}>
                    {r.name}
                    {r.id === currentRestaurant?.id && <Check className="ml-auto w-4 h-4" />}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/admin/onboarding')}>
                  <Plus className="w-4 h-4 mr-2" /> Create New
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                  isActive(item.path)
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "hover:bg-muted text-muted-foreground hover:text-foreground"
                )}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}
          </nav>

          {/* User Info */}
          <div className="p-4 border-t bg-muted/30">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-sm font-medium">{user?.name}</span>
                <span className="text-xs text-muted-foreground truncate w-32">{user?.email}</span>
              </div>
              <Button variant="ghost" size="icon" onClick={logout}>
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-h-screen overflow-x-hidden">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-card border-b p-4 flex items-center justify-between lg:justify-end gap-4">
          <Button variant="ghost" size="icon" className="lg:hidden mr-auto" onClick={() => setSidebarOpen(true)}>
            <Menu className="w-5 h-5" />
          </Button>

          {currentRestaurant && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted py-1 px-3 rounded-full">
              <span>Public Link:</span>
              <a href={`/${currentRestaurant.slug}`} target="_blank" className="text-primary hover:underline font-medium">
                app.com/{currentRestaurant.slug}
              </a>
            </div>
          )}
        </header>

        <div className="p-4 md:p-6">
          <AdminContext.Provider value={{ restaurant: currentRestaurant, isLoading: loadingRestaurants }}>
            {showEmptyState ? (
              <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-4">
                <h2 className="text-2xl font-bold">No Restaurant Selected</h2>
                <p className="text-muted-foreground">Select a restaurant from the sidebar or create a new one.</p>
                <Button onClick={() => navigate('/admin/onboarding')}>
                  <Plus className="w-4 h-4 mr-2" /> Create Restaurant
                </Button>
              </div>
            ) : (
              <Outlet />
            )}
          </AdminContext.Provider>
        </div>
      </main>
    </div>
  );
}
