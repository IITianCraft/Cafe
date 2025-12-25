// User Types
export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'user' | 'admin' | 'kitchen';
  avatar?: string;
  isBlocked?: boolean;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

// Food/Menu Types
export interface FoodItem {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  image: string;
  isAvailable: boolean;
  isVeg: boolean;
  isBestseller?: boolean;
  rating?: number;
  reviewCount?: number;
  preparationTime?: string;
  options?: FoodOption[];
  stock?: number;
  lowStockThreshold?: number;
}

export interface FoodOption {
  id: string;
  name: string;
  price: number;
}

export interface Category {
  id: string;
  name: string;
  image: string;
  itemCount?: number;
}

// Cart Types
export interface CartItem {
  id: string;
  foodItem: FoodItem;
  quantity: number;
  selectedOptions?: FoodOption[];
  specialInstructions?: string;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  tax: number;
  deliveryCharge: number;
  discount: number;
  total: number;
  couponCode?: string;
}

// Order Types
export type OrderStatus = 'pending' | 'accepted' | 'preparing' | 'out-for-delivery' | 'delivered' | 'cancelled';
export type OrderType = 'dine-in' | 'takeaway' | 'delivery';

export interface Order {
  id: string;
  restaurantId: string; // Tenant ID
  userId: string;
  userName: string;
  userPhone?: string;
  userEmail?: string;
  items: CartItem[];
  status: OrderStatus;
  orderType: OrderType;
  subtotal: number;
  tax: number;
  deliveryCharge: number;
  discount: number;
  total: number;
  paymentMethod: string;
  paymentStatus: 'pending' | 'paid' | 'failed';
  deliveryAddress?: Address;
  tableNumber?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  pincode: string;
  landmark?: string;
}

// Reservation Types
export interface Reservation {
  id: string;
  userId: string;
  userName: string;
  userPhone: string;
  userEmail: string;
  date: string;
  time: string;
  guests: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  notes?: string;
  createdAt: string;
}

// Analytics Types
export interface DashboardStats {
  totalSales: number;
  totalOrders: number;
  pendingOrders: number;
  todayRevenue: number;
  weeklyGrowth: number;
  topItems: { name: string; sales: number }[];
  recentOrders: Order[];
  salesChart: { date: string; amount: number }[];
}

// Settings Types
export interface TeamMember {
  name: string;
  role: string;
  image: string;
}

export interface ValueItem {
  icon: string;
  title: string;
  description: string;
}

export interface StatItem {
  label: string;
  value: string;
}

export interface AboutPageSettings {
  storyTitle: string;
  storyParagraphs: string[];
  storyImages: string[];
  stats: StatItem[];
  values: ValueItem[];
  team: TeamMember[];
}

export interface RestaurantSettings {
  name: string;
  logo: string;
  heroImage: string;
  primaryColor: string;
  secondaryColor: string;
  phone: string;
  email: string;
  address: string;
  openingHours: { day: string; open: string; close: string }[];
  socialLinks: { platform: string; url: string }[];
  taxRate: number;
  deliveryCharge: number;
  minimumOrder: number;
  enableWhatsApp: boolean;
  whatsappNumber: string;
  aboutPage: AboutPageSettings;
}

export interface Restaurant {
  id: string;
  name: string;
  slug: string;
  ownerId: string;
  settings: RestaurantSettings;
  createdAt: string;
}

// CRM Types
export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate: string;
  tags: string[];
  notes?: string;
}

// Inventory Types
export interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  lowStockThreshold: number;
  lastRestocked: string;
}
