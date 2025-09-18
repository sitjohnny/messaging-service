import logger from '../logger/logger.ts';
import {
    getEmailMockErrorResponse,
    getEmailMockSuccessResponse,
    type EmailApiResponse,
} from '../mocks/responses/emailSentResponses.ts';
import type { OutboundEmailRequest } from '../models/EmailProvider.ts';

export interface SendGridService {
    sendEmail(
        uuid: string,
        sendGridRequest: OutboundEmailRequest,
        error?: boolean
    ): Promise<EmailApiResponse>;
}

class MockSendGridService implements SendGridService {
    async sendEmail(
        uuid,
        outboundRequestInfo: OutboundEmailRequest,
        error = false
    ): Promise<EmailApiResponse> {
        // Mock implementation that simulates sending an email
        logger.info(
            `Mock send email to ${outboundRequestInfo.to} from ${outboundRequestInfo.from} with body: ${outboundRequestInfo.body}`
        );

        if (error) {
            return Promise.resolve(
                getEmailMockErrorResponse(uuid, [
                    {
                        errorType: 'personalizations.subject',
                        errorMessage:
                            'The subject of your email must be a string at least one character in length.',
                    },
                    {
                        errorType: 'personalizations.subject',
                        errorMessage:
                            'The subject is required. You can get around this requirement if you use a template with a subject defined.',
                    },
                ])
            );
        }

        return Promise.resolve(getEmailMockSuccessResponse(uuid));
    }
}

export default MockSendGridService;
