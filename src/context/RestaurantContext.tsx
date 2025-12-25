import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { restaurantApi } from '../services/api';
import { Restaurant } from '@/types';

interface RestaurantContextType {
    restaurant: Restaurant | null;
    isLoading: boolean;
    error: string | null;
}

const RestaurantContext = createContext<RestaurantContextType>({
    restaurant: null,
    isLoading: true,
    error: null,
});

export const useRestaurant = () => useContext(RestaurantContext);

export const RestaurantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // We need to extract slug from URL manually or use useParams if inside Router
    // But this Provider might wrap routes.
    // Actually, for better composition, we might use a Layout component that fetches data.
    // But let's try to fetch if we detect a slug in pathname that isn't 'admin' or 'auth'.

    const location = window.location.pathname;

    // Simple heuristic: First segment is slug if not reserved
    useEffect(() => {
        const fetchRestaurant = async () => {
            const parts = location.split('/').filter(Boolean);
            if (parts.length === 0) {
                setIsLoading(false);
                return; // Landing page
            }

            const firstPart = parts[0];
            const reserved = ['admin', 'login', 'register', 'auth'];

            if (reserved.includes(firstPart)) {
                setIsLoading(false);
                return;
            }

            // Assume it's a slug
            try {
                setIsLoading(true);
                const res = await restaurantApi.getBySlug(firstPart);
                setRestaurant(res.data.data);
            } catch (err) {
                console.error("Failed to load restaurant", err);
                setError("Restaurant not found");
            } finally {
                setIsLoading(false);
            }
        };

        fetchRestaurant();
    }, [location]);

    return (
        <RestaurantContext.Provider value={{ restaurant, isLoading, error }}>
            {children}
        </RestaurantContext.Provider>
    );
};
