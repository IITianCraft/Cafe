import { Router, Request, Response } from 'express';
import { db } from '../services/firebase';
import { verifyAuth, requireAdmin } from '../middleware/auth';

const router = Router();

// POST /api/admin/remove-demo
router.post('/remove-demo', verifyAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
        // Delete demo menus
        const menuSnapshot = await db.collection('menus').where('demo', '==', true).get();
        const orderSnapshot = await db.collection('orders').where('demo', '==', true).get();

        const menuBatch = db.batch();
        menuSnapshot.docs.forEach(doc => menuBatch.delete(doc.ref));

        const orderBatch = db.batch();
        orderSnapshot.docs.forEach(doc => orderBatch.delete(doc.ref));

        await menuBatch.commit();
        await orderBatch.commit();

        res.json({
            success: true,
            data: {
                deletedMenus: menuSnapshot.size,
                deletedOrders: orderSnapshot.size
            }
        });
    } catch (error) {
        console.error('Remove demo error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// POST /api/admin/seed
router.post('/seed', verifyAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
        const batch = db.batch();

        // 1. Seed Menus
        const menusRef = db.collection('menus');
        const SAMPLE_MENUS = [
            { title: "Avocado Toast", description: "Sourdough bread with mashed avocado, chili flakes, and lime.", price: 12, category: "Breakfast", available: true, imagePath: "", demo: true },
            { title: "Acai Bowl", description: "Frozen acai berries topped with granola, banana, and chia seeds.", price: 14, category: "Breakfast", available: true, imagePath: "", demo: true },
            { title: "Grilled Salmon", description: "Wild-caught salmon with quinoa and steamed asparagus.", price: 24, category: "Dinner", available: true, imagePath: "", demo: true },
            { title: "Quinoa Salad", description: "Mixed greens, quinoa, cherry tomatoes, cucumber, and lemon dressing.", price: 16, category: "Lunch", available: true, imagePath: "", demo: true },
            { title: "Green Smoothie", description: "Spinach, kale, apple, and ginger smoothie.", price: 8, category: "Drinks", available: true, imagePath: "", demo: true, popular: true },
            { title: "Matcha Latte", description: "Ceremonial grade matcha with oat milk.", price: 6, category: "Drinks", available: true, imagePath: "", demo: true }
        ];

        SAMPLE_MENUS.forEach(menu => {
            const docRef = menusRef.doc();
            batch.set(docRef, { ...menu, createdAt: new Date().toISOString() });
        });

        // 2. Seed Orders
        const ordersRef = db.collection('orders');
        const SAMPLE_ORDERS = [
            { userId: "demo_user", items: [{ menuId: "demo_1", qty: 2, priceSnapshot: 12 }], total: 24, status: "completed", demo: true, createdAt: new Date(Date.now() - 86400000).toISOString() },
            { userId: "demo_user", items: [{ menuId: "demo_2", qty: 1, priceSnapshot: 14 }], total: 14, status: "pending", demo: true, createdAt: new Date().toISOString() }
        ];

        SAMPLE_ORDERS.forEach(order => {
            const docRef = ordersRef.doc();
            batch.set(docRef, { ...order });
        });

        // 3. Admin placeholder (Optional, since we might already be admin to call this)
        // But the requirements said "Seed creates 1 admin user doc placeholder"
        // We will create a dummy one just to satisfy requirement if it doesn't exist
        const adminPlaceholderRef = db.collection('users').doc('admin_placeholder');
        batch.set(adminPlaceholderRef, {
            name: "Admin Placeholder",
            email: "admin@nourish.com",
            role: "admin",
            createdAt: new Date().toISOString(),
            demo: true
        });

        await batch.commit();

        res.json({ success: true, message: "Seed completed successfully" });
    } catch (error) {
        console.error('Seed error:', error);
        res.status(500).json({ success: false, error: 'Seed failed' });
    }
});

export default router;
