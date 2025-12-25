import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FoodItem, FoodOption } from '@/types';
import { useCart } from '@/context/CartContext';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Star, Minus, Plus, Clock, Leaf, ShoppingCart, Zap } from 'lucide-react';

interface FoodPopupProps {
  item: FoodItem;
  open: boolean;
  onClose: () => void;
}

export function FoodPopup({ item, open, onClose }: FoodPopupProps) {
  const navigate = useNavigate();
  const { addToCart, openCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState<FoodOption[]>([]);
  const [instructions, setInstructions] = useState('');

  const toggleOption = (option: FoodOption) => {
    setSelectedOptions(prev => {
      const exists = prev.find(o => o.id === option.id);
      if (exists) {
        return prev.filter(o => o.id !== option.id);
      }
      return [...prev, option];
    });
  };

  const optionsPrice = selectedOptions.reduce((sum, opt) => sum + opt.price, 0);
  const totalPrice = (item.price + optionsPrice) * quantity;

  const handleAddToCart = () => {
    addToCart(item, quantity, selectedOptions.length > 0 ? selectedOptions : undefined, instructions || undefined);
    onClose();
    resetState();
  };

  const handleBuyNow = () => {
    addToCart(item, quantity, selectedOptions.length > 0 ? selectedOptions : undefined, instructions || undefined);
    onClose();
    resetState();
    openCart();
  };

  const resetState = () => {
    setQuantity(1);
    setSelectedOptions([]);
    setInstructions('');
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) {
        onClose();
        resetState();
      }
    }}>
      <DialogContent className="sm:max-w-3xl p-0 overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Image Section */}
          <div className="relative aspect-square md:aspect-auto">
            <img
              src={item.image}
              alt={item.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              {item.isBestseller && (
                <Badge className="bg-primary text-primary-foreground">
                  Bestseller
                </Badge>
              )}
              {item.isVeg && (
                <Badge variant="outline" className="bg-background/90 text-success border-success">
                  <Leaf className="w-3 h-3 mr-1" />
                  Pure Veg
                </Badge>
              )}
            </div>
          </div>

          {/* Details Section */}
          <div className="p-6 flex flex-col max-h-[80vh] md:max-h-none overflow-y-auto">
            <div className="flex-1">
              <h2 className="font-display text-2xl font-semibold mb-2">{item.name}</h2>
              
              {/* Rating & Time */}
              <div className="flex items-center gap-4 mb-4">
                {item.rating && (
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-warning text-warning" />
                    <span className="font-medium">{item.rating}</span>
                    {item.reviewCount && (
                      <span className="text-sm text-muted-foreground">
                        ({item.reviewCount} reviews)
                      </span>
                    )}
                  </div>
                )}
                {item.preparationTime && (
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">{item.preparationTime}</span>
                  </div>
                )}
              </div>

              {/* Description */}
              <p className="text-muted-foreground mb-6">{item.description}</p>

              {/* Options */}
              {item.options && item.options.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold mb-3">Add-ons (Optional)</h3>
                  <div className="space-y-2">
                    {item.options.map((option) => (
                      <label
                        key={option.id}
                        className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <Checkbox
                            checked={selectedOptions.some(o => o.id === option.id)}
                            onCheckedChange={() => toggleOption(option)}
                          />
                          <span>{option.name}</span>
                        </div>
                        <span className="font-medium text-primary">+₹{option.price}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Special Instructions */}
              <div className="mb-6">
                <h3 className="font-semibold mb-3">Special Instructions</h3>
                <Textarea
                  placeholder="Any specific requests? (e.g., less spicy, no onions)"
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  rows={2}
                />
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-border pt-4 mt-auto">
              {/* Quantity */}
              <div className="flex items-center justify-between mb-4">
                <span className="font-medium">Quantity</span>
                <div className="flex items-center gap-3 bg-muted rounded-full px-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-8 h-8 rounded-full"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="w-8 text-center font-semibold">{quantity}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-8 h-8 rounded-full"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Price */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-muted-foreground">Total Price</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-primary">₹{totalPrice}</span>
                  {item.originalPrice && quantity === 1 && (
                    <span className="text-muted-foreground line-through">
                      ₹{item.originalPrice}
                    </span>
                  )}
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={handleAddToCart}
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Add to Cart
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleBuyNow}
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Buy Now
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
