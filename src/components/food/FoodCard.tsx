import { useState } from 'react';
import { FoodItem } from '@/types';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, Plus, Leaf } from 'lucide-react';
import { FoodPopup } from './FoodPopup';

interface FoodCardProps {
  item: FoodItem;
}

export function FoodCard({ item }: FoodCardProps) {
  const [showPopup, setShowPopup] = useState(false);
  const { addToCart } = useCart();

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(item, 1);
  };

  return (
    <>
      <div
        className="food-card cursor-pointer group"
        onClick={() => setShowPopup(true)}
      >
        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden">
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          
          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1">
            {item.isBestseller && (
              <Badge className="bg-primary text-primary-foreground text-xs">
                Bestseller
              </Badge>
            )}
            {item.isVeg && (
              <Badge variant="outline" className="bg-background/90 text-success border-success">
                <Leaf className="w-3 h-3 mr-1" />
                Veg
              </Badge>
            )}
          </div>
          
          {/* Quick Add Button */}
          <Button
            size="icon"
            className="absolute bottom-3 right-3 w-10 h-10 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={handleQuickAdd}
          >
            <Plus className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-semibold text-foreground mb-1 truncate">{item.name}</h3>
          
          {/* Rating */}
          {item.rating && (
            <div className="flex items-center gap-1 mb-2">
              <div className="flex items-center gap-0.5 text-warning">
                <Star className="w-3.5 h-3.5 fill-current" />
                <span className="text-sm font-medium">{item.rating}</span>
              </div>
              {item.reviewCount && (
                <span className="text-xs text-muted-foreground">
                  ({item.reviewCount})
                </span>
              )}
            </div>
          )}
          
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3 min-h-[2.5rem]">
            {item.description}
          </p>
          
          {/* Price */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-primary">₹{item.price}</span>
              {item.originalPrice && item.originalPrice > item.price && (
                <span className="text-sm text-muted-foreground line-through">
                  ₹{item.originalPrice}
                </span>
              )}
            </div>
            <Button size="sm" variant="outline" onClick={handleQuickAdd}>
              Add to Cart
            </Button>
          </div>
        </div>
      </div>

      <FoodPopup 
        item={item} 
        open={showPopup} 
        onClose={() => setShowPopup(false)} 
      />
    </>
  );
}
