import request from 'supertest';
import app from '../src/index';

describe('Server API Tests', () => {

    it('GET /health should return 200', async () => {
        const res = await request(app).get('/health');
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
    });

    // Note: Detailed endpoint testing requires a running Firebase Emulator or mock.
    // We will test the structure for now.
});
