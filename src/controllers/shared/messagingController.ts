import { USER_COLUMN_NAMES } from '../../db/dbConstants.ts';
import { internalServerError, invalidAttributesError } from '../../errors/exceptions.ts';
import logger from '../../logger/logger.ts';
import type { MiddlewareParams } from '../../middleware/middleware.ts';
import type { EmailApiResponse } from '../../mocks/responses/emailSentResponses.ts';
import type { TwilioApiResponse } from '../../mocks/responses/smsMmsSentResponse.ts';
import {
    inboundEmailRequestSchema,
    outboundEmailRequestSchema,
    type InboundEmailRequest,
    type OutboundEmailRequest,
} from '../../models/EmailProvider.ts';
import {
    inboundSmsMmsSchema,
    outboundSmsMmsSchema,
    type InboundSmsMmsRequest,
    type OutboundSmsMmsRequest,
} from '../../models/SmsMmsProvider.ts';
import writeDbMessageEvent from '../../services/pgService/pgService.ts';
import MockSendGridService from '../../services/sendGridService.ts';
import MockTwilioService from '../../services/twilioService.ts';
import MockWebhookService from '../../services/webhookService.ts';
import { callOutboundService, callWebhookService } from '../util/controllerUtil.ts';
const { DB_COL_EMAIL, DB_COL_PHONE_NUMBER } = USER_COLUMN_NAMES;

export async function handleIncomingMessage(
    messageType: string,
    middlewareParams: MiddlewareParams,
    checkSuccessFn: (result: TwilioApiResponse | EmailApiResponse) => boolean
) {
    logger.info(
        `Processing inbound message request with body: ${JSON.stringify(middlewareParams.req.body)}`
    );
    try {
        const { req, res } = middlewareParams;
        const mockWebhookServiceInstance = new MockWebhookService();
        const inboundRequestInfo: InboundSmsMmsRequest | InboundEmailRequest = req.body;

        switch (messageType) {
            case DB_COL_EMAIL:
                const validationResultEmail = inboundEmailRequestSchema.safeParse(req?.body);

                if (!validationResultEmail.success) {
                    return invalidAttributesError(validationResultEmail.error, req, res);
                }

                break;
            case DB_COL_PHONE_NUMBER:
                const validationResult = inboundSmsMmsSchema.safeParse(req?.body);

                if (!validationResult.success) {
                    return invalidAttributesError(validationResult.error, req, res);
                }

                break;
            default:
                return invalidAttributesError(
                    `Unsupported message type ${messageType}`,
                    middlewareParams.req,
                    middlewareParams.res
                );
        }
        const result: TwilioApiResponse | EmailApiResponse | any = await callWebhookService(
            mockWebhookServiceInstance,
            inboundRequestInfo,
            middlewareParams
        );

        if (checkSuccessFn(result)) {
            logger.info(
                `Inbound message processed successfully with result: ${JSON.stringify(result)}`
            );
            await writeDbMessageEvent(inboundRequestInfo, messageType, result);
        } else {
            return internalServerError(result, req, res);
        }

        return res.status(200).json(result);
    } catch (error) {
        return internalServerError(error, middlewareParams.req, middlewareParams.res);
    }
}

export async function handleOutboundMessage(
    messageType: string,
    middlewareParams: MiddlewareParams,
    checkSuccessFn: (result: TwilioApiResponse | EmailApiResponse) => boolean
) {
    try {
        logger.info(
            `Processing outbound message request with body: ${JSON.stringify(middlewareParams.req.body)}`
        );

        const { req, res } = middlewareParams;
        const outboundRequestInfo: OutboundEmailRequest | OutboundSmsMmsRequest = req.body;
        let serviceInstance;

        switch (messageType) {
            case DB_COL_EMAIL:
                const validationResultEmail = outboundEmailRequestSchema.safeParse(req?.body);

                if (!validationResultEmail.success) {
                    return invalidAttributesError(validationResultEmail.error, req, res);
                }
                serviceInstance = new MockSendGridService();

                break;
            case DB_COL_PHONE_NUMBER:
                const validationResult = outboundSmsMmsSchema.safeParse(req?.body);

                if (!validationResult.success) {
                    return invalidAttributesError(validationResult.error, req, res);
                }

                serviceInstance = new MockTwilioService();

                break;
            default:
                return invalidAttributesError(
                    `Unsupported message type ${messageType}`,
                    middlewareParams.req,
                    middlewareParams.res
                );
        }

        const result: TwilioApiResponse | EmailApiResponse | any = await callOutboundService(
            messageType,
            serviceInstance,
            outboundRequestInfo,
            middlewareParams
        );

        if (checkSuccessFn(result)) {
            logger.info(
                `Outbound message processed successfully with result: ${JSON.stringify(result)}`
            );
            await writeDbMessageEvent(outboundRequestInfo, messageType, result);
            return res.status(200).json(result);
        } else {
            return internalServerError(result, req, res);
        }
    } catch (error) {
        return internalServerError(error, middlewareParams.req, middlewareParams.res);
    }
}
