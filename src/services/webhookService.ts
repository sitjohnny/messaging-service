import logger from '../logger/logger.ts';
import {
    getEmailMockSuccessResponse,
    type EmailApiResponse,
} from '../mocks/responses/emailSentResponses.ts';
import {
    getSmsMmsMockSuccessResponse,
    type TwilioApiResponse,
} from '../mocks/responses/smsMmsSentResponse.ts';
import { InboundEmailRequestSchema, type InboundEmailRequest } from '../models/EmailProvider.ts';
import { InboundSmsMmsSchema, type InboundSmsMmsRequest } from '../models/SmsMmsProvider.ts';

export interface WebhookService {
    handleIncomingMessage(
        uuid: string,
        inboundMessage: InboundEmailRequest | InboundSmsMmsRequest,
        error: boolean
    ): Promise<EmailApiResponse | TwilioApiResponse | Error>;
}

class MockWebhookService implements WebhookService {
    // generic webhook callback function defined for all providers for now
    webhookCallback = (uuid, provider: string, getMockResponseCallback: any) => {
        return getMockResponseCallback(uuid, provider);
    };

    async handleIncomingMessage(
        uuid: string,
        inboundMessage: InboundEmailRequest | InboundSmsMmsRequest,
        error: boolean
    ): Promise<EmailApiResponse | TwilioApiResponse | Error> {
        if (error) {
            logger.error(
                `<MOCKING WEBHOOK CALL> Simulating error response for message to ${inboundMessage.to} from ${inboundMessage.from}`
            );
            return Promise.reject(new Error('Upstream provider server error'));
        }

        // TODO: Retry logic if provider returns an error
        if (InboundSmsMmsSchema.safeParse(inboundMessage).success) {
            return this.smsWebhookHandler(uuid, inboundMessage as InboundSmsMmsRequest);
        } else if (InboundEmailRequestSchema.safeParse(inboundMessage).success) {
            return this.emailWebhookHandler(uuid, inboundMessage as InboundEmailRequest);
        }

        return Promise.reject(new Error('Unsupported provider type'));
    }

    smsWebhookHandler(uuid: string, inboundMessage: InboundSmsMmsRequest) {
        switch (inboundMessage.messaging_provider_id) {
            case 'twilio':
                logger.info('<MOCKING TWILIO WEBHOOK HANDLER>');
                // code to handle Twilio webhook
                break;
            case 'message-1':
                logger.info('<MOCKING message-1 WEBHOOK HANDLER>');
                // code to handle message-1 webhook
                break;
            case 'message-2':
                logger.info('<MOCKING message-2 WEBHOOK HANDLER>');
                // code to handle message-1 webhook
                break;
            default:
                logger.info('Unsupported Provider');
                return Promise.reject(new Error('Unsupported Provider'));
        }

        // just use the generic webhook callback for now
        return Promise.resolve(
            this.webhookCallback(
                uuid,
                inboundMessage.messaging_provider_id,
                getSmsMmsMockSuccessResponse
            )
        );
    }

    emailWebhookHandler(uuid: string, inboundMessage: InboundEmailRequest) {
        // same logic applies for different email providers, just use generic webhook callback
        return Promise.resolve(
            this.webhookCallback(uuid, inboundMessage.xillio_id, getEmailMockSuccessResponse)
        );
    }
}

export default MockWebhookService;
