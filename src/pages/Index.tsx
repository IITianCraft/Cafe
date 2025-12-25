import { Link } from 'react-router-dom';
import { useRestaurant } from '@/context/RestaurantContext';
import { UserLayout } from '@/components/layout/UserLayout';
import { FoodCard } from '@/components/food/FoodCard';
import { CategoryCarousel } from '@/components/food/CategoryCarousel';
import { Button } from '@/components/ui/button';
import { ArrowRight, UtensilsCrossed, Clock, Truck, Star, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { categoryApi, foodApi } from '@/services/api';

export default function Index() {
  const { restaurant } = useRestaurant();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Fetch Categories
  const { data: categories = [], isLoading: isLoadingCategories } = useQuery({
    queryKey: ['categories', restaurant?.id],
    queryFn: async () => {
      if (!restaurant?.id) return [];
      const res = await categoryApi.getAll(restaurant.id);
      return res.data.data;
    },
    enabled: !!restaurant?.id
  });

  // Fetch Food Items
  const { data: foodItems = [], isLoading: isLoadingFood } = useQuery({
    queryKey: ['food-items', restaurant?.id],
    queryFn: async () => {
      if (!restaurant?.id) return [];
      const res = await foodApi.getAll({ restaurantId: restaurant.id });
      // Map basic fields if necessary, though API typically matches or we map in UI
      // Assuming API returns standard shape. If not, map here like in MenuPage.
      return res.data.data.map((item: any) => ({
        ...item,
        name: item.title || item.name, // Ensure consistent naming if API varies
        image: item.imagePath || item.image
      }));
    },
    enabled: !!restaurant?.id
  });

  const filteredItems = selectedCategory
    ? foodItems.filter((item: any) => item.category === selectedCategory)
    : foodItems;

  const topDishes = foodItems.filter((item: any) => item.isBestseller).slice(0, 4);

  const heroImage = restaurant?.settings?.heroImage || 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1920&h=1080&fit=crop';
  const heroTitle = restaurant?.settings?.heroTitle || 'Seamless Ordering, Anywhere You Are';
  const heroSubtitle = restaurant?.settings?.heroSubtitle || "Whether you're dining at our cozy café or ordering from the comfort of your home, we've got you covered. Browse our chef-curated menu, place your order directly from your table or online, and enjoy fresh, delicious food served your way.";

  if (isLoadingCategories || isLoadingFood) {
    return (
      <UserLayout>
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="animate-spin w-10 h-10 text-primary" />
        </div>
      </UserLayout>
    )
  }

  return (
    <UserLayout>
      {/* Hero Section */}
      <section className="relative min-h-[70vh] hero-gradient flex items-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20 transition-all duration-700"
          style={{ backgroundImage: `url('${heroImage}')` }}
        />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-2xl">
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground mb-6 text-shadow animate-fade-in">
              {heroTitle}
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/90 mb-8 animate-slide-up">
              {heroSubtitle}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 animate-scale-in">
              <Link to={`/${restaurant?.slug}/menu`}>
                <Button size="lg" className="btn-hero w-full sm:w-auto">
                  View Menu
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link to={`/${restaurant?.slug}/contact`}>
                <Button size="lg" className="btn-hero-primary w-full sm:w-auto">
                  Reserve Table
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1/2 h-full hidden lg:block">
          <img
            src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=800&fit=crop"
            alt="Delicious Food"
            className="absolute right-20 top-1/2 -translate-y-1/2 w-96 h-96 object-cover rounded-full shadow-2xl animate-fade-in"
          />
        </div>
      </section>

      {/* Features Strip */}
      <section className="bg-card border-b border-border">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-border">
            {[
              { icon: UtensilsCrossed, title: 'Fresh Food', desc: 'Made to order' },
              { icon: Clock, title: 'Fast Delivery', desc: '30 mins or less' },
              { icon: Truck, title: 'Free Delivery', desc: 'On orders ₹500+' },
              { icon: Star, title: 'Top Rated', desc: '4.8★ on Google' },
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-3 py-6 px-4 justify-center">
                <feature.icon className="w-8 h-8 text-primary" />
                <div>
                  <p className="font-semibold text-foreground">{feature.title}</p>
                  <p className="text-sm text-muted-foreground">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Menu Categories */}
      <section className="py-12 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">
              Explore our menu
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Choose from a diverse menu featuring a delectable array of dishes.
              Our mission is to satisfy your cravings and elevate your dining experience,
              one delicious meal at a time.
            </p>
          </div>

          <CategoryCarousel
            categories={categories}
            selectedCategory={selectedCategory}
            onSelect={setSelectedCategory}
          />
        </div>
      </section>

      {/* Top Dishes */}
      {topDishes.length > 0 && (
        <section className="py-12 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="font-display text-3xl font-bold text-foreground mb-2">
                  Top Dishes
                </h2>
                <p className="text-muted-foreground">Our customers' favorites</p>
              </div>
              <Link to={`/${restaurant?.slug}/menu`}>
                <Button variant="outline">
                  View All
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {topDishes.map((item: any) => (
                <FoodCard key={item.id} item={item} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* All Menu Items (Filtered by Category) */}
      <section className="py-12 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="font-display text-3xl font-bold text-foreground mb-2">
              {selectedCategory ? selectedCategory : 'All Dishes'}
            </h2>
            <p className="text-muted-foreground">
              {filteredItems.length} items available
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredItems.map((item: any) => (
              <FoodCard key={item.id} item={item} />
            ))}
          </div>

          {filteredItems.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No items found in this category</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
            Ready to Order?
          </h2>
          <p className="text-primary-foreground/90 mb-8 max-w-xl mx-auto">
            Download our QR menu for a quick and contactless ordering experience.
            Scan, browse, and order in seconds!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/qr-menu">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                View QR Menu
              </Button>
            </Link>
            <Link to={`/${restaurant?.slug}/menu`}>
              <Button size="lg" className="btn-hero w-full sm:w-auto">
                Order Now
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </UserLayout>
  );
}
