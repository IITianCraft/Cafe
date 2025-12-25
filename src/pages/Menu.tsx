import { useState, useMemo } from 'react';
import { UserLayout } from '@/components/layout/UserLayout';
import { FoodCard } from '@/components/food/FoodCard';
import { CategoryCarousel } from '@/components/food/CategoryCarousel';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, SlidersHorizontal, Leaf, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { foodApi, categoryApi } from '@/services/api';
import { toast } from '@/hooks/use-toast';

import { useRestaurant } from '@/context/RestaurantContext';

export default function Menu() {
  const { restaurant } = useRestaurant();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('default');
  const [vegOnly, setVegOnly] = useState(false);

  // Fetch menu items
  const { data: menuData, isLoading: isLoadingItems } = useQuery({
    queryKey: ['menu', restaurant?.id],
    queryFn: async () => {
      if (!restaurant?.id) return [];
      try {
        const res = await foodApi.getAll({ restaurantId: restaurant.id });
        return res.data.data;
      } catch (err) {
        console.error(err);
        return [];
      }
    },
    enabled: !!restaurant?.id
  });

  // Fetch categories
  const { data: categories = [] } = useQuery({
    queryKey: ['categories', restaurant?.id],
    queryFn: async () => {
      if (!restaurant?.id) return [];
      try {
        const res = await categoryApi.getAll(restaurant.id);
        return res.data.data;
      } catch (err) {
        console.error(err);
        return [];
      }
    },
    enabled: !!restaurant?.id
  });

  const foodItems = menuData || [];
  const isLoading = isLoadingItems;

  const filteredAndSortedItems = useMemo(() => {
    let items = [...foodItems];

    // Filter by category
    if (selectedCategory) {
      items = items.filter((item: any) => item.category === selectedCategory);
    }

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      items = items.filter((item: any) =>
        (item.title || item.name || '').toLowerCase().includes(query) ||
        (item.description || '').toLowerCase().includes(query)
      );
    }

    // Filter veg only (assuming isVeg is available or derived)
    // Legacy support: check isVegetarian or category or tags
    if (vegOnly) {
      items = items.filter((item: any) => item.isVegetarian || item.isVeg || item.category === 'Salads'); // Basic heuristic if flag missing
    }

    // Sort
    switch (sortBy) {
      case 'price-low':
        items.sort((a: any, b: any) => a.price - b.price);
        break;
      case 'price-high':
        items.sort((a: any, b: any) => b.price - a.price);
        break;
      default:
        break;
    }

    return items;
  }, [selectedCategory, searchQuery, sortBy, vegOnly, foodItems]);

  return (
    <UserLayout>
      {/* Header */}
      <section className="bg-muted/50 py-8">
        <div className="container mx-auto px-4">
          <h1 className="font-display text-4xl font-bold text-foreground mb-2">
            Our Menu
          </h1>
          <p className="text-muted-foreground">
            Discover our delicious offerings, crafted with love
          </p>
        </div>
      </section>

      {/* Categories */}
      <section className="py-6 bg-background border-b border-border">
        {categories.length > 0 && (
          <CategoryCarousel
            categories={categories}
            selectedCategory={selectedCategory}
            onSelect={setSelectedCategory}
          />
        )}
      </section>

      {/* Filters */}
      <section className="sticky top-16 z-40 bg-card border-b border-border py-4">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            {/* Search */}
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search dishes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              {/* Veg Filter */}
              <Button
                variant={vegOnly ? 'default' : 'outline'}
                size="sm"
                onClick={() => setVegOnly(!vegOnly)}
                className="gap-2"
              >
                <Leaf className="w-4 h-4" />
                Veg Only
              </Button>

              {/* Sort */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40">
                  <SlidersHorizontal className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Default</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </section>

      {/* Menu Grid */}
      <section className="py-8 bg-background">
        <div className="container mx-auto px-4">
          {/* Results Count */}
          <div className="mb-6">
            <p className="text-muted-foreground">
              Showing {filteredAndSortedItems.length} {filteredAndSortedItems.length === 1 ? 'item' : 'items'}
              {selectedCategory && ` in ${selectedCategory}`}
            </p>
          </div>

          {/* Grid */}
          {isLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : filteredAndSortedItems.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredAndSortedItems.map((item: any) => (
                <FoodCard
                  key={item.id}
                  item={{
                    ...item,
                    name: item.title || item.name,
                    image: item.imagePath || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=500"
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                <Search className="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No dishes found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your search or filters
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedCategory(null);
                  setSearchQuery('');
                  setVegOnly(false);
                  setSortBy('default');
                }}
              >
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </section>
    </UserLayout>
  );
}
