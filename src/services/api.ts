import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { auth } from '@/lib/firebase';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';

// Create axios instance
export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add auth token
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const user = auth.currentUser;
    if (user) {
      try {
        const token = await user.getIdToken();
        config.headers.Authorization = `Bearer ${token}`;
      } catch (e) {
        console.error('Error fetching token', e);
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle 401
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token potentially invalid. 
      // Firebase SDK handles refresh automatically but if backend rejects it, 
      // maybe force logout or refresh?
      // window.dispatchEvent(new CustomEvent('auth:required')); // existing logic
    }
    return Promise.reject(error);
  }
);

// API endpoints
export const restaurantApi = {
  create: (data: { name: string }) => api.post('/api/restaurants', data),
  getMyRestaurants: () => api.get('/api/restaurants/mine'),
  getBySlug: (slug: string) => api.get(`/api/restaurants/slug/${slug}`)
};

export const foodApi = {
  // Requires restaurantId to filter by restaurant
  getAll: (params?: { category?: string; page?: number; limit?: number; restaurantId?: string }) =>
    api.get('/api/menu', { params }),
  getById: (id: string) => api.get(`/api/menu/${id}`),
  // Requires restaurantId in data
  create: (data: any) => api.post('/api/menu', data),
  update: (id: string, data: any) => api.put(`/api/menu/${id}`, data),
  delete: (id: string) => api.delete(`/api/menu/${id}`),
};

export const orderApi = {
  // Requires restaurantId in data
  create: (data: unknown) => api.post('/api/orders', data),
  // Requires restaurantId to filter
  getAll: (params?: { status?: string; restaurantId?: string }) =>
    api.get('/api/orders', { params }),
  getById: (id: string) => api.get(`/api/orders/${id}`),
  updateStatus: (id: string, status: string) => api.put(`/api/orders/${id}`, { status }),
  getUserOrders: (restaurantId?: string) => api.get('/api/orders', { params: { restaurantId } }),
};

export const authApi = {
  // Login/Register handled by Firebase SDK directly
  verify: (idToken: string) => api.post('/api/auth/verify', { idToken }),
};

export const uploadApi = {
  uploadFile: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/api/upload/file', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }
};

export const adminApi = {
  removeDemo: () => api.post('/api/admin/remove-demo'),
  seed: () => api.post('/api/admin/seed')
}

export const reservationApi = {
  getAll: (restaurantId: string) => api.get('/api/reservations', { params: { restaurantId } }),
  create: (data: any) => api.post('/api/reservations', data),
  updateStatus: (id: string, status: string) => api.put(`/api/reservations/${id}`, { status }),
};

export const categoryApi = {
  getAll: (restaurantId: string) => api.get('/api/categories', { params: { restaurantId } }),
  create: (data: { name: string; image?: string; restaurantId: string }) => api.post('/api/categories', data),
  update: (id: string, data: any) => api.put(`/api/categories/${id}`, data),
  delete: (id: string) => api.delete(`/api/categories/${id}`),
};

export const contactApi = {
  create: (data: any) => api.post('/api/contact', data),
  getAll: (restaurantId: string) => api.get('/api/contact', { params: { restaurantId } }),
  respond: (id: string, data: { response: string }) => api.put(`/api/contact/${id}`, data),
};


export const tablesApi = {
  getAll: (restaurantId: string) => api.get('/api/tables', { params: { restaurantId } }),
  create: (data: any) => api.post('/api/tables', data),
  update: (id: string, data: any) => api.put(`/api/tables/${id}`, data),
  delete: (id: string) => api.delete(`/api/tables/${id}`),
  getAvailable: (restaurantId: string, date: string, time: string) =>
    api.get('/api/tables/available', { params: { restaurantId, date, time } })
};

export const userApi = {
  getCustomers: (restaurantId: string) => api.get('/api/users/customers', { params: { restaurantId } }),
  registerVisit: (restaurantId: string) => api.post('/api/users/visit', { restaurantId }),
  updateProfile: (data: Partial<{ name: string; phone: string }>) => api.put('/api/users/profile', data),
  getProfile: () => api.get('/api/users/profile'),
};

export const settingsApi = {
  update: (restaurantId: string, settings: any) => api.put(`/api/restaurants/${restaurantId}/settings`, settings)
}

export default api;
