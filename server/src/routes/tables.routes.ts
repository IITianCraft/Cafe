import { Router, Request, Response } from 'express';
import { db } from '../services/firebase';
import { verifyAuth } from '../middleware/auth';
import { firestore } from 'firebase-admin';

const router = Router();

// Helper to parse time string "7:00 PM" to minutes from midnight
const parseTime = (timeStr: string): number => {
    const [time, modifier] = timeStr.split(' ');
    let [hours, minutes] = time.split(':').map(Number);
    if (hours === 12) hours = 0;
    if (modifier === 'PM') hours += 12;
    return hours * 60 + minutes;
};

// POST /api/tables - Create a table
router.post('/', verifyAuth, async (req: Request, res: Response) => {
    try {
        const { restaurantId, name, capacity, seats } = req.body;
        const { uid } = req.user!;

        // Verify ownership
        const restaurantDoc = await db.collection('restaurants').doc(restaurantId).get();
        if (!restaurantDoc.exists || restaurantDoc.data()?.ownerId !== uid) {
            return res.status(403).json({ success: false, error: 'Unauthorized' });
        }

        const newTable = {
            restaurantId,
            name, // e.g., "Table 1"
            capacity: Number(capacity || seats), // seats count
            createdAt: new Date().toISOString()
        };

        const docRef = await db.collection('tables').add(newTable);
        res.status(201).json({ success: true, data: { id: docRef.id, ...newTable } });
    } catch (error) {
        console.error('Create table error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// GET /api/tables - List tables for a restaurant
router.get('/', verifyAuth, async (req: Request, res: Response) => {
    try {
        const { restaurantId } = req.query;
        const { uid } = req.user!;

        if (!restaurantId) return res.status(400).json({ error: 'Missing restaurantId' });

        // Verify ownership
        const restaurantDoc = await db.collection('restaurants').doc(restaurantId as string).get();
        if (!restaurantDoc.exists || restaurantDoc.data()?.ownerId !== uid) {
            return res.status(403).json({ success: false, error: 'Unauthorized' });
        }

        const snapshot = await db.collection('tables')
            .where('restaurantId', '==', restaurantId)
            .get();

        const tables = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        // Sort by name if possible, simple alpha sort
        tables.sort((a: any, b: any) => a.name.localeCompare(b.name, undefined, { numeric: true }));

        res.json({ success: true, data: tables });
    } catch (error) {
        console.error('List tables error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// PUT /api/tables/:id - Update table
router.put('/:id', verifyAuth, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { name, capacity, restaurantId } = req.body;

        // Ownership check is a bit tricky without reading the doc first or trusting restaurantId in body.
        // Better validation:
        const tableDoc = await db.collection('tables').doc(id).get();
        if (!tableDoc.exists) return res.status(404).json({ error: 'Table not found' });

        const existingData = tableDoc.data();
        if (existingData?.restaurantId !== restaurantId) {
            return res.status(403).json({ error: 'Mismatch in restaurant ID' });
        }

        await db.collection('tables').doc(id).update({ name, capacity: Number(capacity) });
        res.json({ success: true, data: { id, ...existingData, name, capacity } });
    } catch (error) {
        console.error('Update table error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// DELETE /api/tables/:id
router.delete('/:id', verifyAuth, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await db.collection('tables').doc(id).delete();
        res.json({ success: true });
    } catch (error) {
        console.error('Delete table error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// GET /api/tables/available - Check availability
router.get('/available', async (req: Request, res: Response) => {
    try {
        const { restaurantId, date, time } = req.query; // date in ISO string, time in "7:00 PM" string

        if (!restaurantId || !date || !time) {
            return res.status(400).json({ error: 'Missing required params' });
        }

        // 1. Get all tables for this restaurant
        const tablesSnap = await db.collection('tables')
            .where('restaurantId', '==', restaurantId)
            .get();

        if (tablesSnap.empty) {
            return res.json({ success: true, data: [] });
        }

        const tables = tablesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // 2. Get all reservations for this date
        // Note: 'date' query param comes as full ISO string from frontend (e.g. "2024-01-01T00:00:00.000Z")
        // But DB stores 'date' field exactly as sent.

        const reservationsSnap = await db.collection('reservations')
            .where('restaurantId', '==', restaurantId)
            .where('date', '==', date)
            .get(); // We might need to handle timezone issues if strict exact match fails, but assuming consistent client generation

        const reservations = reservationsSnap.docs.map(doc => doc.data());

        // 3. Filter available tables
        const requestedTimeMins = parseTime(time as string);
        const bookingDuration = 3 * 60; // 3 hours

        const availableTables = tables.filter((table: any) => {
            // Find any reservation for this table that overlaps
            const hasConflict = reservations.some((res: any) => {
                if (res.tableId !== table.id) return false;

                // If status is cancelled, ignore
                if (res.status === 'cancelled' || res.status === 'rejected') return false;

                const resTimeMins = parseTime(res.time);

                // Conflict Logic:
                // Request: [requested, requested + 180]
                // Existing: [resTime, resTime + 180]

                const startA = requestedTimeMins;
                const endA = requestedTimeMins + bookingDuration;
                const startB = resTimeMins;
                const endB = resTimeMins + bookingDuration;

                return (startA < endB && endA > startB);
            });

            return !hasConflict;
        });

        res.json({ success: true, data: availableTables });

    } catch (error) {
        console.error('Availability check error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

export default router;
