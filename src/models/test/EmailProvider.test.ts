import { inboundEmailRequestSchema, outboundEmailRequestSchema } from '../EmailProvider';

describe('inboundEmailSchema Validation Tests', () => {
    const validInboundEmail = {
        from: 'user@usehatchapp.com',
        to: 'contact@gmail.com',
        xillio_id: 'xil_123',
        body: '<h1>Hello, World!</h1>',
        attachments: ['https://example.com/file.pdf'],
        timestamp: '2024-11-01T14:00:00Z',
    };

    test('should validate a valid inbound email payload', () => {
        expect(() => inboundEmailRequestSchema.parse(validInboundEmail)).not.toThrow();
    });

    test('should fail with invalid email format', () => {
        const payload = { ...validInboundEmail, from: '[contact@gmail.com]' };
        expect(() => inboundEmailRequestSchema.parse(payload)).toThrow();
    });

    test('undefined attachment should throw', () => {
        const payload = { ...validInboundEmail, attachments: undefined };
        expect(() => inboundEmailRequestSchema.parse(payload)).toThrow();
    });

    test('empty attachment list is allowed', () => {
        const payload = { ...validInboundEmail, attachments: [] };
        expect(() => inboundEmailRequestSchema.parse(payload)).not.toThrow();
    });

    test('should fail with an invalid "xillo_id"', () => {
        const payload = { ...validInboundEmail, xillio_id: null };
        expect(() => inboundEmailRequestSchema.parse(payload)).toThrow();
    });

    test('should fail with an invalid timestamp', () => {
        const payload = { ...validInboundEmail, timestamp: 'invalid-date' };
        expect(() => inboundEmailRequestSchema.parse(payload)).toThrow();
    });
});

describe('outboundEmailRequestSchema Validation Tests', () => {
    const validOutboundEmail = {
        from: '[user@usehatchapp.com](mailto:user@usehatchapp.com)',
        to: '[contact@gmail.com](mailto:contact@gmail.com)',
        body: 'Plain text email.',
        timestamp: '2024-11-01T14:00:00Z',
        attachments: [],
    };

    test('should validate a valid outbound email payload', () => {
        expect(() => outboundEmailRequestSchema.parse(validOutboundEmail)).not.toThrow();
    });

    test('should fail with invalid email format', () => {
        const payload = { ...validOutboundEmail, to: '[contact@gmail]' };
        expect(() => outboundEmailRequestSchema.parse(payload)).toThrow();
    });

    test('should validate a valid outbound email with attachments', () => {
        const payload = {
            ...validOutboundEmail,
            attachments: ['https://example.com/doc.docx'],
        };
        expect(() => outboundEmailRequestSchema.parse(payload)).not.toThrow();
    });

    test('should fail test with a missing "to" email', () => {
        const { to, ...payload } = validOutboundEmail;
        expect(() => outboundEmailRequestSchema.parse(payload)).toThrow();
    });

    test('should fail with an invalid "attachments" URL', () => {
        const payload = { ...validOutboundEmail, attachments: ['not-a-url'] };
        expect(() => outboundEmailRequestSchema.parse(payload)).toThrow();
    });
});
