import type { InboundSmsMmsRequest, OutboundSmsMmsRequest } from '../../models/SmsMmsProvider.ts';

export const outboundSmsMmsRequestMock: OutboundSmsMmsRequest = {
    from: '+18045551234',
    to: '+12016661234',
    type: 'sms',
    body: 'text message',
    attachments: [],
    timestamp: '2024-11-01T14:00:00Z',
};

export const inboundSmsMmsRequestMock: InboundSmsMmsRequest = {
    from: '+16461234567',
    to: '+16463211755',
    type: 'mms',
    messaging_provider_id: 'message-1',
    body: 'hello world 1',
    attachments: [],
    timestamp: '2024-11-01T14:00:00Z',
};
