import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

// Import Routes
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/users.routes';
import menuRoutes from './routes/menu.routes';
import orderRoutes from './routes/orders.routes';
import uploadRoutes from './routes/upload.routes';
import adminRoutes from './routes/admin.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors({
    origin: '*', // Allow all origins to prevent CORS issues
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
    credentials: true
}));
app.use(express.json());
app.use(morgan('dev'));

// Health Check
app.get('/health', (req, res) => {
    res.json({ success: true, message: 'Server is running' });
});

// Root Route
app.get('/', (req, res) => {
    res.json({ success: true, message: 'Nourish Admin Backend is running' });
});

import restaurantRoutes from './routes/restaurant.routes';
import reservationsRoutes from './routes/reservations.routes';
import categoriesRoutes from './routes/categories.routes';
import contactRoutes from './routes/contact.routes';

import tablesRoutes from './routes/tables.routes';

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/reservations', reservationsRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/tables', tablesRoutes);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

export default app;
