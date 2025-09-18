import type { OutboundSmsMmsRequest } from '../../models/SmsMmsProvider.ts';

export interface TwilioApiResponse {
    account_sid: string;
    api_version: string;
    body: string;
    date_created: string | null;
    date_sent: string | null;
    date_updated: string | null;
    direction: string;
    error_code: number | null;
    error_message: string | null;
    from: string;
    num_media: string;
    num_segments: string;
    price: string | null;
    price_unit: string | null;
    messaging_service_sid: string;
    sid: string;
    status: string;
    subresource_uris: {
        media: string;
    };
    to: string;
    uri: string;
}

export const getSmsMmsMockSuccessResponse = (
    correlationId: string,
    outboundRequestInfo: OutboundSmsMmsRequest
): TwilioApiResponse => {
    const date_sent = new Date().toISOString();

    return {
        account_sid: 'ACXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
        api_version: '2010-04-01',
        body: outboundRequestInfo.body,
        date_created: outboundRequestInfo.timestamp,
        date_sent: date_sent,
        date_updated: date_sent,
        direction: 'outbound-api',
        error_code: null,
        error_message: null,
        from: outboundRequestInfo.from,
        num_media: '0',
        num_segments: '1',
        price: null,
        price_unit: null,
        messaging_service_sid: 'MGaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
        sid: correlationId,
        status: 'queued',
        subresource_uris: {
            media: '/2010-04-01/Accounts/ACaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa/Messages/SMaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa/Media.json',
        },
        to: outboundRequestInfo.to,
        uri: '/2010-04-01/Accounts/ACaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa/Messages/SMaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa.json',
    };
};

export const getSmsMmsMockErrorResponse = (
    correlationId: string,
    outboundRequestInfo: OutboundSmsMmsRequest
): TwilioApiResponse => {
    return {
        account_sid: 'ACXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
        api_version: '2010-04-01',
        body: outboundRequestInfo.body,
        date_created: null,
        date_sent: null,
        date_updated: null,
        direction: 'outbound-api',
        error_code: 500,
        error_message: 'Internal Server Error. Error sending message',
        from: outboundRequestInfo.from,
        num_media: '0',
        num_segments: '1',
        price: null,
        price_unit: null,
        messaging_service_sid: 'MGaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
        sid: correlationId,
        status: 'failed',
        subresource_uris: {
            media: '/2010-04-01/Accounts/ACaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa/Messages/SMaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa/Media.json',
        },
        to: outboundRequestInfo.to,
        uri: '/2010-04-01/Accounts/ACaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa/Messages/SMaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa.json',
    };
};
