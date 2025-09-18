import { Request, Response } from 'express';
import { messageStatusSuccess } from '../services/twilioService.ts';
import { USER_COLUMN_NAMES } from '../db/dbConstants.ts';
import { handleIncomingMessage, handleOutboundMessage } from './shared/messagingController.ts';
import logger from '../logger/logger.ts';

const { DB_COL_PHONE_NUMBER } = USER_COLUMN_NAMES;

/**
 * Handles an outgoing SMS/MMS request.
 * Validates the incoming request, sends the message, and updates the messaging service database.
 * Returns an error response if validation fails or message sending fails.
 * @param {Request} req - The incoming request object.
 * @param {Response} res - The outgoing response object.
 */
export async function sendSmsMessage(req: Request, res: Response) {
    const middlewareParams = {
        req,
        res,
    };
    logger.info(`Checking if message status is success: ${messageStatusSuccess}`);
    return handleOutboundMessage(DB_COL_PHONE_NUMBER, middlewareParams, messageStatusSuccess);
}

/**
 * Handles an incoming SMS/MMS webhook request.
 * Validates the incoming request, processes the message, and updates the messaging service database.
 * Returns an error response if validation fails or message processing fails.
 * @param {Request} req - The incoming request object.
 * @param {Response} res - The outgoing response object.
 */
export async function receiveSmsMessage(req: Request, res: Response) {
    const middlewareParams = {
        req,
        res,
    };
    logger.info(`Checking if message status is success: ${messageStatusSuccess}`);
    return handleIncomingMessage(DB_COL_PHONE_NUMBER, middlewareParams, messageStatusSuccess);
}
