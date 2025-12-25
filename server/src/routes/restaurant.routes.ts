import { Router, Request, Response } from 'express';
import { db } from '../services/firebase';
import { verifyAuth } from '../middleware/auth';

const router = Router();

// Interfaces
interface Restaurant {
    name: string;
    slug: string;
    ownerId: string;
    createdAt: string;
    settings: {
        theme: string;
        currency: string;
    };
}

// Helper to normalize slug
const createSlug = (name: string): string => {
    return name
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
};

// GET /api/restaurants/mine - List restaurants owned by the authenticated user
router.get('/mine', verifyAuth, async (req: Request, res: Response) => {
    try {
        const { uid } = req.user!;
        const snapshot = await db.collection('restaurants').where('ownerId', '==', uid).get();

        const restaurants = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        res.json({ success: true, data: restaurants });
    } catch (error) {
        console.error('List restaurants error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// POST /api/restaurants - Create a new restaurant
router.post('/', verifyAuth, async (req: Request, res: Response) => {
    try {
        const { name } = req.body;
        const { uid } = req.user!;

        if (!name) {
            return res.status(400).json({ success: false, error: 'Restaurant name is required' });
        }

        const baseSlug = createSlug(name);
        let slug = baseSlug;
        let counter = 1;

        // Ensure slug uniqueness
        while (true) {
            const existing = await db.collection('restaurants').where('slug', '==', slug).get();
            if (existing.empty) break;
            slug = `${baseSlug}-${counter}`;
            counter++;
        }

        const newRestaurant: Restaurant = {
            name,
            slug,
            ownerId: uid,
            createdAt: new Date().toISOString(),
            settings: {
                theme: 'orange', // Default
                currency: 'USD'
            }
        };

        const docRef = await db.collection('restaurants').add(newRestaurant);

        // Update user's managedRestaurants list
        await db.collection('users').doc(uid).set({
            managedRestaurants: require('firebase-admin').firestore.FieldValue.arrayUnion(docRef.id)
        }, { merge: true });

        res.status(201).json({
            success: true,
            data: {
                id: docRef.id,
                ...newRestaurant
            }
        });
    } catch (error) {
        console.error('Create restaurant error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// GET /api/restaurants/slug/:slug - Public Read for formatting/loading
router.get('/slug/:slug', async (req: Request, res: Response) => {
    try {
        const { slug } = req.params;
        const snapshot = await db.collection('restaurants').where('slug', '==', slug).limit(1).get();

        if (snapshot.empty) {
            return res.status(404).json({ success: false, error: 'Restaurant not found' });
        }

        const doc = snapshot.docs[0];
        const data = doc.data();

        // Return only public info
        const publicInfo = {
            id: doc.id,
            name: data.name,
            slug: data.slug,
            settings: data.settings
        };

        res.json({ success: true, data: publicInfo });
    } catch (error) {
        console.error('Get restaurant by slug error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// PUT /api/restaurants/:id/settings - Update restaurant settings
router.put('/:id/settings', verifyAuth, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { theme, currency, ...otherSettings } = req.body;
        const { uid } = req.user!;

        const docRef = db.collection('restaurants').doc(id);
        const doc = await docRef.get();

        if (!doc.exists) {
            return res.status(404).json({ success: false, error: 'Restaurant not found' });
        }

        const data = doc.data();

        // Verify ownership
        if (data?.ownerId !== uid) {
            return res.status(403).json({ success: false, error: 'Unauthorized' });
        }

        // Update settings (merge with existing)
        const currentSettings = data?.settings || {};
        const updatedSettings = {
            ...currentSettings,
            theme: theme || currentSettings.theme,
            currency: currency || currentSettings.currency,
            ...otherSettings // Allow other settings field updates
        };

        await docRef.update({
            settings: updatedSettings
        });

        res.json({
            success: true,
            data: updatedSettings
        });

    } catch (error) {
        console.error('Update settings error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

export default router;
