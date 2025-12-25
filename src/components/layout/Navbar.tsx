import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, Menu, X, User, LogOut, ClipboardList, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useRestaurant } from '@/context/RestaurantContext';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';



export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isAuthenticated, user, logout, openLoginModal } = useAuth();
  const { itemCount, openCart } = useCart();
  const { restaurant } = useRestaurant();
  const location = useLocation();

  const navLinks = [
    { name: 'Home', path: `/${restaurant?.slug || ''}` },
    { name: 'Menu', path: `/${restaurant?.slug || ''}/menu` },
    { name: 'Reserve Table', path: `/${restaurant?.slug || ''}/reservations` },
    { name: 'About', path: `/${restaurant?.slug || ''}/about` },
    { name: 'Contact Us', path: `/${restaurant?.slug || ''}/contact` },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b border-border shadow-soft">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            {restaurant?.settings?.logo ? (
              <img
                src={restaurant.settings.logo}
                alt={restaurant.name}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-display font-bold text-lg">
                  {(restaurant?.name || 'CR').slice(0, 2).toUpperCase()}
                </span>
              </div>
            )}
            <span className="font-display text-xl font-semibold text-foreground hidden sm:block">
              {restaurant?.name || 'Cafe Resto'}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  "text-sm font-medium transition-colors duration-200 relative py-1",
                  isActive(link.path)
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {link.name}
                {isActive(link.path) && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
                )}
              </Link>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Cart Button */}
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              onClick={openCart}
            >
              <ShoppingCart className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-xs font-bold rounded-full flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Button>

            {/* Auth Section - Desktop */}
            <div className="hidden md:flex items-center gap-2">
              {isAuthenticated ? (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full">
                      <User className="w-5 h-5" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-56" align="end">
                    <div className="space-y-3">
                      <div className="border-b border-border pb-3">
                        <p className="font-medium text-foreground">{user?.name}</p>
                        <p className="text-sm text-muted-foreground">{user?.email}</p>
                      </div>
                      <div className="space-y-1">
                        <Link to="/orders">
                          <Button variant="ghost" className="w-full justify-start gap-2">
                            <ClipboardList className="w-4 h-4" />
                            My Orders
                          </Button>
                        </Link>
                        <Link to="/profile">
                          <Button variant="ghost" className="w-full justify-start gap-2">
                            <User className="w-4 h-4" />
                            My Profile
                          </Button>
                        </Link>
                        {user?.role === 'admin' && (
                          <Link to="/admin">
                            <Button variant="ghost" className="w-full justify-start gap-2">
                              <User className="w-4 h-4" />
                              Admin Panel
                            </Button>
                          </Link>
                        )}
                        <Button
                          variant="ghost"
                          className="w-full justify-start gap-2 text-destructive hover:text-destructive"
                          onClick={logout}
                        >
                          <LogOut className="w-4 h-4" />
                          Logout
                        </Button>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={openLoginModal}
                  className="rounded-full px-6"
                >
                  Sign In
                </Button>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-card animate-fade-in">
          <div className="container mx-auto px-4 py-4 space-y-4">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  "block py-2 text-sm font-medium",
                  isActive(link.path) ? "text-primary" : "text-muted-foreground"
                )}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}

            <div className="border-t border-border pt-4">
              {isAuthenticated ? (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Hello, {user?.name}</p>
                  <Link to="/orders" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start gap-2">
                      <ClipboardList className="w-4 h-4" />
                      My Orders
                    </Button>
                  </Link>
                  <Link to="/profile" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start gap-2">
                      <User className="w-4 h-4" />
                      My Profile
                    </Button>
                  </Link>
                  {user?.role === 'admin' && (
                    <Link to="/admin" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button variant="ghost" className="w-full justify-start gap-2">
                        <User className="w-4 h-4" />
                        Admin Panel
                      </Button>
                    </Link>
                  )}
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-2 text-destructive"
                    onClick={() => {
                      logout();
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </Button>
                </div>
              ) : (
                <Button
                  variant="default"
                  className="w-full"
                  onClick={() => {
                    openLoginModal();
                    setIsMobileMenuOpen(false);
                  }}
                >
                  Sign In
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
