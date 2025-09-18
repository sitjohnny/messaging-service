import request from 'supertest';
import http from 'http';
import app from '../../index'; // Import the default export
import config from '../../config/config';

describe('baseRouter Test', () => {
    let server: http.Server;

    beforeAll((done) => {
        server = app.listen(config.port, () => {
            done();
        });
    });

    afterAll((done) => {
        server.close(() => {
            done();
        });
    });

    test('should return 200 for /', async () => {
        const response = await request(app).get('/');
        expect(response.status).toBe(200);
    });
});
