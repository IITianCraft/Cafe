import { useNavigate } from 'react-router-dom';
import { useCart } from '@/context/CartContext';
import { useRestaurant } from '@/context/RestaurantContext';
import { useAuth } from '@/context/AuthContext';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Minus, Plus, Trash2, ShoppingBag, Tag, X } from 'lucide-react';
import { useState } from 'react';

export function CartDrawer() {
  const navigate = useNavigate();
  const { cart, isCartOpen, closeCart, updateQuantity, removeFromCart, applyCoupon, removeCoupon } = useCart();
  const { isAuthenticated, openLoginModal } = useAuth();
  const [couponInput, setCouponInput] = useState('');

  const { restaurant } = useRestaurant();

  const handleCheckout = () => {
    closeCart();
    if (!isAuthenticated) {
      openLoginModal();
      return;
    }
    if (restaurant?.slug) {
      navigate(`/${restaurant.slug}/checkout`);
    }
  };

  const handleApplyCoupon = () => {
    if (couponInput.trim()) {
      applyCoupon(couponInput.trim());
      setCouponInput('');
    }
  };

  const formatPrice = (price: number) => `₹${price.toFixed(2)}`;

  return (
    <Sheet open={isCartOpen} onOpenChange={closeCart}>
      <SheetContent className="w-full sm:max-w-md flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5" />
            Your Cart ({cart.items.length} items)
          </SheetTitle>
        </SheetHeader>

        {cart.items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
            <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-4">
              <ShoppingBag className="w-12 h-12 text-muted-foreground" />
            </div>
            <h3 className="font-medium text-lg mb-2">Your cart is empty</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Looks like you haven't added anything yet
            </p>
            <Button onClick={closeCart}>Browse Menu</Button>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 -mx-6 px-6">
              <div className="space-y-4 py-4">
                {cart.items.map((item) => (
                  <div key={item.id} className="flex gap-3 p-3 bg-muted/50 rounded-lg">
                    <img
                      src={item.foodItem.image}
                      alt={item.foodItem.name}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm truncate">{item.foodItem.name}</h4>
                      {item.selectedOptions && item.selectedOptions.length > 0 && (
                        <p className="text-xs text-muted-foreground">
                          {item.selectedOptions.map(o => o.name).join(', ')}
                        </p>
                      )}
                      <p className="text-sm font-semibold text-primary mt-1">
                        {formatPrice(item.foodItem.price * item.quantity)}
                      </p>
                    </div>
                    <div className="flex flex-col items-end justify-between">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-6 h-6 text-muted-foreground hover:text-destructive"
                        onClick={() => removeFromCart(item.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                      <div className="flex items-center gap-1 bg-background rounded-full border">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-7 h-7 rounded-full"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-7 h-7 rounded-full"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="border-t border-border pt-4 space-y-4">
              {/* Coupon Section */}
              {cart.couponCode ? (
                <div className="flex items-center justify-between p-3 bg-accent rounded-lg">
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-accent-foreground" />
                    <span className="text-sm font-medium text-accent-foreground">{cart.couponCode}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-6 h-6"
                    onClick={removeCoupon}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter coupon code"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    className="flex-1"
                  />
                  <Button variant="outline" onClick={handleApplyCoupon}>
                    Apply
                  </Button>
                </div>
              )}

              {/* Price Summary */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatPrice(cart.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">GST (5%)</span>
                  <span>{formatPrice(cart.tax)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Delivery</span>
                  <span>{cart.deliveryCharge === 0 ? 'Free' : formatPrice(cart.deliveryCharge)}</span>
                </div>
                {cart.discount > 0 && (
                  <div className="flex justify-between text-success">
                    <span>Discount</span>
                    <span>-{formatPrice(cart.discount)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between text-base font-semibold">
                  <span>Total</span>
                  <span className="text-primary">{formatPrice(cart.total)}</span>
                </div>
              </div>

              {cart.subtotal < 500 && (
                <p className="text-xs text-muted-foreground text-center">
                  Add ₹{(500 - cart.subtotal).toFixed(0)} more for free delivery
                </p>
              )}

              <Button className="w-full" size="lg" onClick={handleCheckout}>
                Proceed to Checkout
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
