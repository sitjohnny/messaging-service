import { Request, Response, type NextFunction } from 'express';
import { getAllConversationIds } from '../services/pgService/util/conversationsUtil.ts';
import logger from '../logger/logger.ts';
import { databaseError } from '../errors/exceptions.ts';
import { getMessagesByConversationId } from '../services/pgService/util/messagesUtil.ts';

/**
 * Retrieves all conversation IDs from the database.
 * @param {Request} req - The incoming HTTP request.
 * @param {Response} res - The outgoing HTTP response.
 * @param {NextFunction} next - The next function to call in the middleware chain.
 * @return a list of conversation IDs
 */
export async function getAllConversations(req: Request, res: Response, next: NextFunction) {
    try {
        const conversationIds = await getAllConversationIds();
        return res.status(200).json({ conversations: conversationIds });
    } catch (error) {
        logger.error(`[getAllConversations] Error getting all conversations: ${error}`);
        return databaseError(error, req, res);
    }
}

/**
 * Retrieves all messages for a given conversation ID from the database.
 * @param {Request} req - The incoming HTTP request.
 * @param {Response} res - The outgoing HTTP response.
 * @param {NextFunction} next - The next function to call in the middleware chain.
 * @return a list of messages for the given conversation ID
 */
export async function getMessages(req: Request, res: Response, next: NextFunction) {
    try {
        if (!req.params?.conversationId) {
            return res.status(400).json({ message: 'conversationId is required' });
        }
        const messages = await getMessagesByConversationId(req?.params?.conversationId ?? '');
        return res.status(200).json({ messages: messages });
    } catch (error) {
        logger.error(
            `[getAllMessagesByConversationId] Error getting all messages with conversation id ${req.params.conversationId}: ${error}`
        );
        return databaseError(error, req, res);
    }
}
