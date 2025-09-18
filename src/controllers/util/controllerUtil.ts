import { internalServerError } from '../../errors/exceptions.ts';
import type { SendGridService } from '../../services/sendGridService.ts';
import type { MiddlewareParams } from '../../middleware/middleware.ts';
import { USER_COLUMN_NAMES } from '../../db/dbConstants.ts';
import type { TwilioService } from '../../services/twilioService.ts';
import type { WebhookService } from '../../services/webhookService.ts';
import type { InboundEmailRequest, OutboundEmailRequest } from '../../models/EmailProvider.ts';
import type { InboundSmsMmsRequest, OutboundSmsMmsRequest } from '../../models/SmsMmsProvider.ts';

/**
 * Calls the appropriate service to send an outbound message based on the message type.
 * @param {string} messageType - The type of message being sent. Should be either USER_COLUMN_NAMES.DB_COL_PHONE_NUMBER or USER_COLUMN_NAMES.DB_COL_EMAIL.
 * @param {SendGridService | TwilioService} service - The service to call.
 * @param {OutboundEmailRequest | OutboundSmsMmsRequest} data - The data to pass to the sendMessage or sendEmail method.
 * @param {MiddlewareParams} middlewareParams - The middleware parameters.
 * @returns {Promise<any>} A promise that resolves to the result of the sendMessage or sendEmail method, or rejects with an internalServerError error response.
 */
export async function callOutboundService(
    messageType: string,
    service: SendGridService | TwilioService,
    data: OutboundEmailRequest | OutboundSmsMmsRequest,
    middlewareParams: MiddlewareParams
) {
    const mockErrorResponse: boolean = middlewareParams.req.query?.error === 'true';

    switch (messageType) {
        case USER_COLUMN_NAMES.DB_COL_PHONE_NUMBER:
            service = service as TwilioService;
            data = data as OutboundSmsMmsRequest;
            try {
                const result = await service.sendMessage(
                    middlewareParams.req?.uuid,
                    data,
                    mockErrorResponse
                );
                return result;
            } catch (error) {
                return internalServerError(error, middlewareParams.req, middlewareParams.res);
            }
        case USER_COLUMN_NAMES.DB_COL_EMAIL:
            service = service as SendGridService;
            data = data as OutboundEmailRequest;
            try {
                const result = await service.sendEmail(
                    middlewareParams.req?.uuid,
                    data,
                    mockErrorResponse
                );
                return result;
            } catch (error) {
                return internalServerError(error, middlewareParams.req, middlewareParams.res);
            }
        default:
            return internalServerError(
                'Invalid message type',
                middlewareParams.req,
                middlewareParams.res
            );
    }
}

/**
 * Calls the appropriate webhook service method to process an inbound message based on the message type.
 * @param {WebhookService} webhooksService - The webhook service to call.
 * @param {InboundEmailRequest | InboundSmsMmsRequest} data - The data to pass to the handleIncomingMessage method.
 * @param {MiddlewareParams} middlewareParams - The middleware parameters.
 * @returns {Promise<any>} A promise that resolves to the result of the handleIncomingMessage method, or rejects with an internalServerError error response.
 */
export async function callWebhookService(
    webhooksService: WebhookService,
    data: InboundEmailRequest | InboundSmsMmsRequest,
    middlewareParams: MiddlewareParams
) {
    const mockErrorResponse: boolean = middlewareParams.req.query?.error === 'true';

    try {
        const result = await webhooksService.handleIncomingMessage(
            middlewareParams.req?.uuid,
            data,
            mockErrorResponse
        );
        return result;
    } catch (error) {
        return internalServerError(error, middlewareParams.req, middlewareParams.res);
    }
}
