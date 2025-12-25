import { useRef } from 'react';
import { Category } from '@/types';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CategoryCarouselProps {
  categories: Category[];
  selectedCategory: string | null;
  onSelect: (category: string | null) => void;
}

export function CategoryCarousel({ categories, selectedCategory, onSelect }: CategoryCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 200;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="relative">
      {/* Scroll Buttons */}
      <Button
        variant="outline"
        size="icon"
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-card shadow-md hidden md:flex"
        onClick={() => scroll('left')}
      >
        <ChevronLeft className="w-4 h-4" />
      </Button>
      
      <Button
        variant="outline"
        size="icon"
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-card shadow-md hidden md:flex"
        onClick={() => scroll('right')}
      >
        <ChevronRight className="w-4 h-4" />
      </Button>

      {/* Carousel */}
      <div
        ref={scrollRef}
        className="flex gap-6 overflow-x-auto scrollbar-hide px-8 md:px-12 py-4"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {/* All Category */}
        <button
          onClick={() => onSelect(null)}
          className="flex flex-col items-center gap-2 flex-shrink-0 group"
        >
          <div
            className={cn(
              "category-circle bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center",
              selectedCategory === null && "ring-4 ring-primary/30"
            )}
          >
            <span className="text-primary-foreground font-semibold text-sm">All</span>
          </div>
          <span className={cn(
            "text-sm font-medium transition-colors",
            selectedCategory === null ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
          )}>
            All Items
          </span>
        </button>

        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onSelect(category.name)}
            className="flex flex-col items-center gap-2 flex-shrink-0 group"
          >
            <div
              className={cn(
                "category-circle",
                selectedCategory === category.name && "ring-4 ring-primary/30"
              )}
            >
              <img
                src={category.image}
                alt={category.name}
                className="w-full h-full object-cover"
              />
            </div>
            <span className={cn(
              "text-sm font-medium transition-colors",
              selectedCategory === category.name ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
            )}>
              {category.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
