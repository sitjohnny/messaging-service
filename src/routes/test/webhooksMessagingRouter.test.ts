import request from 'supertest';
import http from 'http';
import app from '../../index'; // Import the default export
import config from '../../config/config';
import { inboundSmsMmsRequestMock } from '../../mocks/requests/smsMmsRequestMocks';
import { inboundEmailRequestMock } from '../../mocks/requests/emailRequestMock';

jest.mock('../../services/pgService/pgService.ts', () => {
    return {
        __esModule: true,
        default: jest.fn().mockImplementation(() => {
            return {
                writeDbMessageEvent: jest.fn().mockResolvedValue({
                    messageId: '12345',
                }),
            };
        }),
    };
});

describe('Webhooks Messaging Router Test', () => {
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
        const response = await request(app).get('/api/webhooks/');
        expect(response.status).toBe(200);
        expect(response.text).toBe('Webhooks service is running');
    });

    test('should return 200 for /sms', async () => {
        const response = await request(app)
            .post('/api/webhooks/sms')
            .send(inboundSmsMmsRequestMock);
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('status');
    });

    test('should return 200 for /email', async () => {
        const response = await request(app)
            .post('/api/webhooks/email')
            .send(inboundEmailRequestMock);
        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            messageId: expect.any(String),
            status: expect.any(Number),
            message: expect.any(String),
        });
    });
});
