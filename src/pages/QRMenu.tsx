import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FoodCard } from '@/components/food/FoodCard';
import { CategoryCarousel } from '@/components/food/CategoryCarousel';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { AuthModal } from '@/components/auth/AuthModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { categories, foodItems } from '@/data/mockData';
import { ShoppingCart, Search, Leaf, MapPin, Bell } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { toast } from '@/hooks/use-toast';

// Mobile-optimized QR Menu view with table number support
export default function QRMenu() {
  const [searchParams] = useSearchParams();
  const tableNumber = searchParams.get('table');
  
  const { itemCount, openCart, cart } = useCart();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [vegOnly, setVegOnly] = useState(false);

  // Show table number notification
  useEffect(() => {
    if (tableNumber) {
      toast({
        title: `Welcome to Table ${tableNumber}!`,
        description: "Browse our menu and order directly from your table.",
      });
    }
  }, [tableNumber]);

  const filteredItems = foodItems.filter(item => {
    if (selectedCategory && item.category !== selectedCategory) return false;
    if (vegOnly && !item.isVeg) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return item.name.toLowerCase().includes(query) || item.description.toLowerCase().includes(query);
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card border-b border-border shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">CR</span>
              </div>
              <div>
                <span className="font-display font-semibold block leading-tight">Cafe Resto</span>
                {tableNumber && (
                  <Badge variant="secondary" className="text-xs mt-0.5">
                    <MapPin className="w-3 h-3 mr-1" />
                    Table {tableNumber}
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {tableNumber && (
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="w-4 h-4" />
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                className="relative"
                onClick={openCart}
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Cart
                {itemCount > 0 && (
                  <span className="absolute -top-2 -right-2 w-5 h-5 bg-primary text-primary-foreground text-xs font-bold rounded-full flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </Button>
            </div>
          </div>
          
          {/* Table Info Banner */}
          {tableNumber && (
            <div className="bg-primary/10 rounded-lg p-2 mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">Dine-in at Table {tableNumber}</span>
              </div>
              <Button variant="ghost" size="sm" className="text-xs h-7">
                Call Waiter
              </Button>
            </div>
          )}
          
          {/* Search */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search dishes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button
              variant={vegOnly ? 'default' : 'outline'}
              size="icon"
              onClick={() => setVegOnly(!vegOnly)}
              title="Veg Only"
            >
              <Leaf className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Categories */}
      <div className="py-4 border-b border-border">
        <CategoryCarousel
          categories={categories}
          selectedCategory={selectedCategory}
          onSelect={setSelectedCategory}
        />
      </div>

      {/* Menu Items */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-muted-foreground">
            {filteredItems.length} items found
          </span>
          {selectedCategory && (
            <Button variant="ghost" size="sm" onClick={() => setSelectedCategory(null)}>
              Clear filter
            </Button>
          )}
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          {filteredItems.map((item) => (
            <FoodCard key={item.id} item={item} />
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-2">No dishes found</p>
            <Button
              variant="link"
              onClick={() => {
                setSelectedCategory(null);
                setSearchQuery('');
                setVegOnly(false);
              }}
            >
              Clear all filters
            </Button>
          </div>
        )}
      </div>

      {/* Fixed Cart Button */}
      {itemCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-card border-t border-border">
          <Button className="w-full" size="lg" onClick={openCart}>
            <ShoppingCart className="w-5 h-5 mr-2" />
            View Cart ({itemCount} items) • ₹{cart.total.toFixed(0)}
          </Button>
          {tableNumber && (
            <p className="text-xs text-center text-muted-foreground mt-2">
              Order will be served at Table {tableNumber}
            </p>
          )}
        </div>
      )}

      <CartDrawer />
      <AuthModal />
    </div>
  );
}
