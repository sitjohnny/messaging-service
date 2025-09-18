interface SendGridError {
    errorType: string;
    errorMessage: string;
}

export interface EmailApiResponse {
    messageId: string;
    status: number;
    message?: string | undefined;
    error?: Array<SendGridError> | undefined;
}

export const getEmailMockSuccessResponse = (
    messageId: string,
    provider?: string
): EmailApiResponse => {
    return {
        messageId: messageId,
        status: 200,
        message: `Processed incoming message from messaging provider: ${provider}.`,
    };
};

export const getEmailMockErrorResponse = (
    messageId: string,
    errors: Array<SendGridError>
): EmailApiResponse => {
    return {
        messageId: messageId,
        status: 400,
        error: errors,
    };
};
