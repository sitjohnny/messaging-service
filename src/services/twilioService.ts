import { TWILIO_MESSAGE_SUCCESS_LIST } from '../constants/constants.ts';
import logger from '../logger/logger.ts';
import {
    getSmsMmsMockErrorResponse,
    getSmsMmsMockSuccessResponse,
    type TwilioApiResponse,
} from '../mocks/responses/smsMmsSentResponse.ts';
import type { OutboundSmsMmsRequest } from '../models/SmsMmsProvider.ts';

export interface TwilioService {
    sendMessage(
        uuid: string,
        sendSmsRequestInfo: OutboundSmsMmsRequest,
        error?: boolean
    ): Promise<TwilioApiResponse>;
}

export function messageStatusSuccess(result) {
    return TWILIO_MESSAGE_SUCCESS_LIST.includes(result?.status);
}

class MockTwilioService implements TwilioService {
    async sendMessage(
        uuid: string,
        outboundRequestInfo: OutboundSmsMmsRequest,
        error = false
    ): Promise<TwilioApiResponse> {
        // Mock implementation that simulates sending an SMS
        // TODO: Retry logic if provider returns an error
        logger.info(
            `<MOCKING TWILIO API CALL> To ${outboundRequestInfo.to} from ${outboundRequestInfo.from} with body: ${outboundRequestInfo.body}`
        );

        if (error) {
            logger.error(
                `<MOCKING TWILIO API CALL> Simulating error response for message to ${outboundRequestInfo.to} from ${outboundRequestInfo.from}`
            );
            return Promise.resolve(getSmsMmsMockErrorResponse(uuid, outboundRequestInfo));
        }

        return Promise.resolve(getSmsMmsMockSuccessResponse(uuid, outboundRequestInfo));
    }
}

export default MockTwilioService;
