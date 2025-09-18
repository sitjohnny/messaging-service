import request from 'supertest';
import http from 'http';
import app from '../../index'; // Import the default export
import config from '../../config/config';
import { outboundSmsMmsRequestMock } from '../../mocks/requests/smsMmsRequestMocks';
import { outboundEmailRequestMock } from '../../mocks/requests/emailRequestMock';

// TODO: Use actual mock responses
jest.mock('../../services/twilioService', () => {
    return {
        __esModule: true,
        default: jest.fn().mockImplementation(() => {
            return {
                sendMessage: jest.fn().mockResolvedValue({
                    status: 'queued',
                    sid: '12345',
                    body: 'Message sent successfully',
                }),
            };
        }),
        messageStatusSuccess: jest.requireActual('../../services/twilioService')
            .messageStatusSuccess,
    };
});

jest.mock('../../services/sendGridService', () => {
    return {
        __esModule: true,
        default: jest.fn().mockImplementation(() => {
            return {
                sendEmail: jest.fn().mockResolvedValue({
                    status: 200,
                    messageId: '12345',
                    message: 'Email sent successfully',
                }),
            };
        }),
    };
});
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

describe('Outbound Messaging Router Test', () => {
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
        const response = await request(app).get('/api/messages/');
        expect(response.status).toBe(200);
        expect(response.text).toBe('Outbound Messaging service is running');
    });

    test('should return 200 for /sms', async () => {
        const response = await request(app)
            .post('/api/messages/sms')
            .send(outboundSmsMmsRequestMock);
        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            body: expect.any(String),
            sid: expect.any(String),
            status: expect.any(String),
        });
        expect(response.body.status).toBe('queued');
    });

    test('should return 200 for /email', async () => {
        const response = await request(app)
            .post('/api/messages/email')
            .send(outboundEmailRequestMock);
        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            messageId: expect.any(String),
            status: expect.any(Number),
            message: expect.any(String),
        });
    });
});
