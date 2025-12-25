import { createContext, useContext } from 'react';

export interface AdminContextType {
    restaurant: any | null; // using any for restaurant type compatibility for now
    isLoading: boolean;
}

export const AdminContext = createContext<AdminContextType>({
    restaurant: null,
    isLoading: true
});

export const useAdminRestaurant = () => useContext(AdminContext);
