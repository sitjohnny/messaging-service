import { USER_COLUMN_NAMES } from '../../db/dbConstants.ts';
import { internalServerError, invalidAttributesError } from '../../errors/exceptions.ts';
import logger from '../../logger/logger.ts';
import type { MiddlewareParams } from '../../middleware/middleware.ts';
import type { EmailApiResponse } from '../../mocks/responses/emailSentResponses.ts';
import type { TwilioApiResponse } from '../../mocks/responses/smsMmsSentResponse.ts';
import {
    InboundEmailRequestSchema,
    OutboundEmailRequestSchema,
    type InboundEmailRequest,
    type OutboundEmailRequest,
} from '../../models/EmailProvider.ts';
import {
    InboundSmsMmsSchema,
    OutboundSmsMmsSchema,
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
        `Processing inbound message request with body: ${JSON.stringify(middlewareParams.req?.body)}`
    );
    try {
        const { req, res } = middlewareParams;
        const mockWebhookServiceInstance = new MockWebhookService();
        const inboundRequestInfo: InboundSmsMmsRequest | InboundEmailRequest = req?.body;

        const validationResultEmail = InboundEmailRequestSchema.safeParse(inboundRequestInfo);
        const validationResultSms = InboundSmsMmsSchema.safeParse(inboundRequestInfo);

        switch (messageType) {
            case DB_COL_EMAIL:
                if (!validationResultEmail.success) {
                    return invalidAttributesError(validationResultEmail.error, req, res);
                }

                break;
            case DB_COL_PHONE_NUMBER:
                if (!validationResultSms.success) {
                    return invalidAttributesError(validationResultSms.error, req, res);
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
        const outboundRequestInfo: OutboundEmailRequest | OutboundSmsMmsRequest = req?.body;
        const validationResultEmail = OutboundEmailRequestSchema.safeParse(outboundRequestInfo);
        const validationResultSms = OutboundSmsMmsSchema.safeParse(outboundRequestInfo);

        let serviceInstance;

        switch (messageType) {
            case DB_COL_EMAIL:
                if (!validationResultEmail.success) {
                    return invalidAttributesError(validationResultEmail.error, req, res);
                }
                serviceInstance = new MockSendGridService();

                break;
            case DB_COL_PHONE_NUMBER:
                if (!validationResultSms.success) {
                    return invalidAttributesError(validationResultSms.error, req, res);
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
