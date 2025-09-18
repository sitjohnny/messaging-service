import { outboundSmsMmsSchema, inboundSmsMmsSchema } from '../SmsMmsProvider';

describe('outboundSmsMmsSchema Validation Tests', () => {
    const validOutboundPayload = {
        from: '+12345678901',
        to: '+19876543210',
        type: 'sms',
        body: 'Hello, World!',
        timestamp: '2024-11-01T14:00:00Z',
    };

    test('should validate a valid outbound SMS payload', () => {
        expect(() => outboundSmsMmsSchema.parse(validOutboundPayload)).not.toThrow();
    });

    test('should validate a valid outbound MMS payload', () => {
        const payload = {
            ...validOutboundPayload,
            type: 'mms',
            attachments: ['https://example.com/image.jpg'],
        };
        expect(() => outboundSmsMmsSchema.parse(payload)).not.toThrow();
    });

    test('should fail with an invalid "from" phone number', () => {
        const payload = { ...validOutboundPayload, from: '1234567890' };
        expect(() => outboundSmsMmsSchema.parse(payload)).toThrow();
    });

    test('should fail with an invalid "to" phone number', () => {
        const payload = { ...validOutboundPayload, to: '19876543210' };
        expect(() => outboundSmsMmsSchema.parse(payload)).toThrow();
    });

    test('should fail with an invalid "type"', () => {
        const payload = { ...validOutboundPayload, type: 'email' };
        expect(() => outboundSmsMmsSchema.parse(payload)).toThrow();
    });

    test('should fail if "body" is missing', () => {
        const { body, ...payload } = validOutboundPayload;
        expect(() => outboundSmsMmsSchema.parse(payload)).toThrow();
    });

    test('should fail with an invalid timestamp format', () => {
        const payload = { ...validOutboundPayload, timestamp: '2024-11-01' };
        expect(() => outboundSmsMmsSchema.parse(payload)).toThrow();
    });
});

describe('inboundSmsMmsSchema Validation Tests (SMS)', () => {
    const validInboundSmsMms = {
        from: '+12345678901',
        to: '+19876543210',
        type: 'sms',
        messaging_provider_id: 'msg_123',
        body: 'Received message.',
        timestamp: '2024-11-01T14:00:00Z',
    };

    test('should validate a valid inbound SMS payload', () => {
        expect(() => inboundSmsMmsSchema.parse(validInboundSmsMms)).not.toThrow();
    });

    test('should validate a valid inbound MMS payload', () => {
        const payload = {
            ...validInboundSmsMms,
            type: 'mms',
            attachments: ['https://example.com/image.jpg'],
        };

        expect(() => inboundSmsMmsSchema.parse(payload)).not.toThrow();
    });

    test('should fail if "messaging_provider_id" is missing', () => {
        const payload = {
            ...validInboundSmsMms,
            messaging_provider_id: undefined,
        };
        expect(() => inboundSmsMmsSchema.parse(payload)).toThrow();
    });

    test('should fail if body is missing', () => {
        const payload = {
            ...validInboundSmsMms,
            body: undefined,
        };

        expect(() => inboundSmsMmsSchema.parse(payload)).toThrow();
    });

    test('should fail with invalid "attachments" URL', () => {
        const payload = { ...validInboundSmsMms, attachments: ['invalid-url'] };
        expect(() => inboundSmsMmsSchema.parse(payload)).toThrow();
    });

    test('should fail if timestamp is not in ISO 8601 format', () => {
        const payload = { ...validInboundSmsMms, timestamp: '11/01/2024 14:00' };
        expect(() => inboundSmsMmsSchema.parse(payload)).toThrow();
    });
});
