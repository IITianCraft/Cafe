import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { RestaurantSettings } from '@/types';

interface SettingsContextType {
  settings: RestaurantSettings;
  updateSettings: (updates: Partial<RestaurantSettings>) => void;
  isLoading: boolean;
}

const defaultSettings: RestaurantSettings = {
  name: 'Cafe Resto',
  logo: '',
  heroImage: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1920&h=600&fit=crop',
  primaryColor: '#f97316',
  secondaryColor: '#1e293b',
  phone: '+91 98765 43210',
  email: 'hello@caferesto.com',
  address: '123 Food Street, Culinary District, Mumbai - 400001',
  openingHours: [
    { day: 'Monday', open: '09:00', close: '22:00' },
    { day: 'Tuesday', open: '09:00', close: '22:00' },
    { day: 'Wednesday', open: '09:00', close: '22:00' },
    { day: 'Thursday', open: '09:00', close: '22:00' },
    { day: 'Friday', open: '09:00', close: '22:00' },
    { day: 'Saturday', open: '10:00', close: '23:00' },
    { day: 'Sunday', open: '10:00', close: '21:00' },
  ],
  socialLinks: [
    { platform: 'instagram', url: 'https://instagram.com/caferesto' },
    { platform: 'facebook', url: 'https://facebook.com/caferesto' },
    { platform: 'twitter', url: 'https://twitter.com/caferesto' },
  ],
  taxRate: 5,
  deliveryCharge: 40,
  minimumOrder: 200,
  enableWhatsApp: true,
  whatsappNumber: '+919876543210',
  aboutPage: {
    storyTitle: 'Where Every Meal Tells a Story',
    storyParagraphs: [
      'Founded in 2014, Cafe Resto began as a small family kitchen with a simple dream: to bring authentic, home-style cooking to our community. What started as a 10-seat café has grown into a beloved culinary destination.',
      'Our founder, inspired by generations of family recipes and a passion for hospitality, created a space where food is more than just sustenance—it\'s an experience that brings people together.',
      'Today, we continue that legacy by combining traditional recipes with modern techniques, creating dishes that honor our roots while exciting contemporary palates. Every plate that leaves our kitchen carries the love and dedication of our team.',
    ],
    storyImages: [
      'https://images.unsplash.com/photo-1600891964092-4316c288032e?w=400&h=500&fit=crop',
      'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=400&h=500&fit=crop',
    ],
    stats: [
      { label: 'Years of Excellence', value: '10+' },
      { label: 'Happy Customers', value: '50K+' },
      { label: 'Dishes Served', value: '100+' },
      { label: 'Expert Chefs', value: '15' },
    ],
    values: [
      { icon: 'UtensilsCrossed', title: 'Quality Ingredients', description: 'We source only the freshest, highest-quality ingredients from local suppliers.' },
      { icon: 'Users', title: 'Customer First', description: 'Your satisfaction is our top priority. We go above and beyond to ensure a memorable experience.' },
      { icon: 'Award', title: 'Culinary Excellence', description: 'Our team of expert chefs brings years of experience and passion to every dish.' },
      { icon: 'Heart', title: 'Made with Love', description: 'Every meal is prepared with care and attention, just like home-cooked food.' },
    ],
    team: [
      { name: 'Chef Rahul Sharma', role: 'Head Chef', image: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=300&h=300&fit=crop' },
      { name: 'Priya Patel', role: 'Pastry Chef', image: 'https://images.unsplash.com/photo-1595257841889-eca2678454e2?w=300&h=300&fit=crop' },
      { name: 'Amit Kumar', role: 'Sous Chef', image: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=300&h=300&fit=crop' },
    ],
  },
};

const STORAGE_KEY = 'cafe_resto_settings';

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<RestaurantSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setSettings({ ...defaultSettings, ...parsed, aboutPage: { ...defaultSettings.aboutPage, ...parsed.aboutPage } });
      } catch (e) {
        console.error('Failed to parse settings', e);
      }
    }
    setIsLoading(false);
  }, []);

  const updateSettings = (updates: Partial<RestaurantSettings>) => {
    setSettings(prev => {
      const newSettings = { ...prev, ...updates };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
      return newSettings;
    });
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, isLoading }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}