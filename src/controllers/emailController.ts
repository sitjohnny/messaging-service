import { Request, Response } from 'express';
import { USER_COLUMN_NAMES } from '../db/dbConstants.ts';
import { handleIncomingMessage, handleOutboundMessage } from './shared/messagingController.ts';

const { DB_COL_EMAIL } = USER_COLUMN_NAMES;

/**
 * Handles an outgoing email request.
 * Validates the incoming request, sends the email, and updates the messaging service database.
 * Returns an error response if validation fails or message sending fails.
 * @param {Request} req - The incoming request object.
 * @param {Response} res - The outgoing response object.
 * @param {NextFunction} next - The next function in the middleware chain.
 */
export async function sendEmail(req: Request, res: Response) {
    const middlewareParams = {
        req,
        res,
    };
    return handleOutboundMessage(
        DB_COL_EMAIL,
        middlewareParams,
        (result) => result?.status === 200
    );
}

export async function receiveEmail(req: Request, res: Response) {
    const middlewareParams = {
        req,
        res,
    };
    return handleIncomingMessage(
        DB_COL_EMAIL,
        middlewareParams,
        (result) => result?.status === 200
    );
}
