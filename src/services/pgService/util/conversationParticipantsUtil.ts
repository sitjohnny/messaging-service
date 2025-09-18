import logger from '../../../logger/logger.ts';
import pgClient from '../../../db/db.ts';
import type {
    InboundSmsMmsRequest,
    OutboundSmsMmsRequest,
} from '../../../models/SmsMmsProvider.ts';
import type { InboundEmailRequest, OutboundEmailRequest } from '../../../models/EmailProvider.ts';
import {
    CONVERSATION_PARTICIPANT_TABLE_NAME,
    DB_COL_CONVERSATION_ID,
    DB_COL_USER_ID,
} from '../../../db/dbConstants.ts';
import { createNewConversation } from './conversationsUtil.ts';

/**
 * Checks if a conversation between two users exists in the sms_conversations table.
 * If it does, returns the conversation ID.
 * If not, creates a new conversation and returns the conversation ID.
 * @param {number} senderId - The ID of the sender of the message.
 * @param {number} recipientId - The ID of the recipient of the message.
 * @param {InboundSmsMmsRequest | InboundEmailRequest | OutboundEmailRequest | OutboundSmsMmsRequest} messageRequest - The message request containing the sender and recipient phone numbers or email addresses. For logging purposes.
 * @param {pgClient} client - The PostgreSQL client to use for the query.
 * @returns {Promise<number>} A promise that resolves to the conversation ID if the operation succeeds, or 0 if the operation fails.
 */
export async function getOrCreateConversation(
    senderId: number,
    recipientId: number,
    messageRequest:
        | InboundSmsMmsRequest
        | InboundEmailRequest
        | OutboundEmailRequest
        | OutboundSmsMmsRequest,
    client = pgClient
): Promise<number> {
    let conversationId = await findConversationBetweenUsers(
        senderId,
        recipientId,
        messageRequest,
        client
    );
    if (!conversationId) {
        logger.debug(
            `[getOrCreateConversation] No existing conversation found between users ${senderId} and ${recipientId}. Creating new conversation.`
        );
        conversationId = await createConversationIdBetweenUsers(senderId, recipientId, client);
    }
    return conversationId;
}

/**
 * Checks if a conversation between two users exists in the sms_conversation_participants table.
 * If a conversation exists, returns the ID of the existing conversation.
 * If no conversation exists, returns 0.
 * @param {number} senderId - The ID of the sender of the message.
 * @param {number} recipientId - The ID of the recipient of the message.
 * @param {InboundSmsMmsRequest | OutboundSmsMmsRequest} messageRequest - The message request containing the sender and recipient phone numbers. For logging purposes.
 * @returns {Promise<number>} A promise that resolves to the conversation ID if the operation succeeds, or 0 if the operation fails.
 */
async function findConversationBetweenUsers(
    senderId: number,
    recipientId: number,
    messageRequest:
        | InboundSmsMmsRequest
        | InboundEmailRequest
        | OutboundEmailRequest
        | OutboundSmsMmsRequest,
    client = pgClient
): Promise<number> {
    const userIds = [senderId, recipientId];
    let conversationId = 0;

    const checkQuery = `
        SELECT ${DB_COL_CONVERSATION_ID}
        FROM ${CONVERSATION_PARTICIPANT_TABLE_NAME}
        WHERE ${DB_COL_USER_ID} = ANY($1::int[])
        GROUP BY ${DB_COL_CONVERSATION_ID}
        HAVING COUNT(DISTINCT ${DB_COL_USER_ID}) = 2;
    `;

    try {
        logger.debug(
            `[getConversationBetweenUsers] Checking if conversation between users ${messageRequest.from} and ${messageRequest.to} exists.`
        );
        const res = await client.query(checkQuery, [userIds]);
        if (res?.rows?.length > 0) {
            conversationId = res.rows[0].conversation_id;
            logger.debug(
                `[getConversationBetweenUsers] Found existing conversation ${conversationId} between users ${senderId} and ${recipientId}.`
            );
            return conversationId;
        }
        logger.debug(
            `[getConversationBetweenUsers] No existing conversation found between users ${senderId} and ${recipientId}.`
        );
        return 0;
    } catch (error) {
        logger.error(
            `[getConversationBetweenUsers] Error checking conversation with error: ${error}`
        );
        return 0;
    }
}

/**
 * Creates a new conversation between two users in the sms_conversations table and
 * inserts the participants into the sms_conversation_participants table.
 * @param {number} senderId - The ID of the sender of the message.
 * @param {number} recipientId - The ID of the recipient of the message.
 * @returns {Promise<number>} A promise that resolves to the ID of the newly created conversation if the operation succeeds, or 0 if the operation fails.
 */
async function createConversationIdBetweenUsers(
    senderId: number,
    recipientId: number,
    client = pgClient
): Promise<number> {
    const userIds = [senderId, recipientId];
    const conversationId = await createNewConversation(client);

    if (conversationId) {
        // Insert the participants into the sms_conversation_participants table
        // using the newly created conversation ID.
        const participantsQuery = `
            INSERT INTO ${CONVERSATION_PARTICIPANT_TABLE_NAME} (${DB_COL_CONVERSATION_ID}, ${DB_COL_USER_ID})
            VALUES ($1, $2), ($1, $3);
        `;
        const participantsValues = [conversationId, ...userIds];

        try {
            logger.debug(
                `[createConversationIdBetweenUsers] Adding participants to conversation ${conversationId}.`
            );
            await client.query(participantsQuery, participantsValues);
            return conversationId;
        } catch (error) {
            console.error(
                `[createConversationIdBetweenUsers] Error updating conversation_participants table: ${error}`
            );
            return 0;
        }
    }

    return 0;
}
