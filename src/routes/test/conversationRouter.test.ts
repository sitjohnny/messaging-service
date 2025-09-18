import request from 'supertest';
import http from 'http';
import app from '../../index';
import config from '../../config/config';
import { databaseError } from '../../errors/exceptions';
import { getMessagesByConversationId } from '../../services/pgService/util/messagesUtil';
import { getAllConversationIds } from '../../services/pgService/util/conversationsUtil';

// Mock the database utility functions
jest.mock('../../services/pgService/util/messagesUtil', () => ({
    getMessagesByConversationId: jest.fn(),
}));
jest.mock('../../services/pgService/util/conversationsUtil', () => ({
    getAllConversationIds: jest.fn(),
}));

// Mock the database error handler
jest.mock('../../errors/exceptions', () => ({
    databaseError: jest.fn((error, req, res) =>
        res.status(500).json({ error: 'Database Error', details: 'Mocked Error' })
    ),
}));

describe('Conversations Controller', () => {
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

    // Test suite for getAllConversations
    describe('getAllConversations', () => {
        test('should return 200 with a list of conversation IDs on success', async () => {
            const mockConversationIds = [1, 2, 3];
            (getAllConversationIds as jest.Mock).mockResolvedValue(mockConversationIds);

            const response = await request(app).get('/api/conversations/');

            expect(response.status).toBe(200);
            expect(response.body).toEqual({ conversations: mockConversationIds });
            expect(getAllConversationIds).toHaveBeenCalled();
        });

        test('should return 500 on database error', async () => {
            (getAllConversationIds as jest.Mock).mockRejectedValue(new Error('Test DB Error'));

            const response = await request(app).get('/api/conversations/');

            expect(response.status).toBe(500);
            expect(response.body).toEqual({ error: 'Database Error', details: 'Mocked Error' });
            expect(databaseError).toHaveBeenCalled();
        });
    });

    // Test suite for getMessages
    describe('getMessages', () => {
        test('should return 200 with a list of messages on success', async () => {
            const mockMessages = [
                { id: 1, body: 'message 1', created_at: '2023-01-01T12:00:00Z' },
                { id: 2, body: 'message 2', created_at: '2023-01-01T12:01:00Z' },
            ];
            const conversationId = 'convo-123';

            (getMessagesByConversationId as jest.Mock).mockResolvedValue(mockMessages);

            const response = await request(app).get(
                `/api/conversations/${conversationId}/messages`
            );

            expect(response.status).toBe(200);
            expect(response.body).toEqual({ messages: mockMessages });
            expect(getMessagesByConversationId).toHaveBeenCalledWith(conversationId);
        });

        test('should return 404 if conversationId is missing', async () => {
            const response = await request(app).get('/api/conversations//messages');

            expect(response.status).toBe(404);
        });

        test('should return 500 on database error', async () => {
            const conversationId = 'convo-123';
            (getMessagesByConversationId as jest.Mock).mockRejectedValue(
                new Error('Test DB Error')
            );

            const response = await request(app).get(
                `/api/conversations/${conversationId}/messages`
            );

            expect(response.status).toBe(500);
            expect(response.body).toEqual({ error: 'Database Error', details: 'Mocked Error' });
            expect(databaseError).toHaveBeenCalled();
        });
    });
});
