import logger from '../../../logger/logger.ts';
import pgClient from '../../../db/db.ts';
import type { TwilioApiResponse } from '../../../mocks/responses/smsMmsSentResponse.ts';
import type {
    InboundSmsMmsRequest,
    OutboundSmsMmsRequest,
} from '../../../models/SmsMmsProvider.ts';
import type { InboundEmailRequest, OutboundEmailRequest } from '../../../models/EmailProvider.ts';
import type { EmailApiResponse } from '../../../mocks/responses/emailSentResponses.ts';
import { MESSAGING_PROVIDER_ID, XILLIO_ID } from '../../../constants/constants.ts';
import {
    DB_COL_CONVERSATION_ID,
    DB_COL_CREATED_AT,
    MESSAGE_COLUMN_NAMES,
    MESSAGE_TABLE_NAME,
} from '../../../db/dbConstants.ts';

const {
    DB_COL_SENDER_ID,
    DB_COL_RECIPIENT_ID,
    DB_COL_BODY,
    DB_COL_PROVIDER_ID,
    DB_COL_MESSAGE_TYPE,
    DB_COL_ATTACHMENTS,
    DB_COL_STATUS,
} = MESSAGE_COLUMN_NAMES;

export interface NewMessageDetails {
    conversationId: number;
    senderId: number;
    recipientId: number;
    messageRequest:
        | InboundSmsMmsRequest
        | InboundEmailRequest
        | OutboundSmsMmsRequest
        | OutboundEmailRequest;
    messageType: string;
    messagingApiResponse?: TwilioApiResponse | EmailApiResponse | null;
}

/**
 * Inserts a message into the sms_messages table linking it to the given conversation and both users.
 * This function performs the following steps:
 * 1. Extracts the messaging provider ID from the message request if it exists.
 * 2. Constructs the values array for the query with the conversation ID, sender ID, recipient ID, body, messaging provider ID, message type, attachments, status, and timestamp.
 * 3. Queries the sms_messages table with the constructed values array.
 * 4. Logs the result of the query, either the inserted ID or the error message.
 * @param {MessageRequestInfo} messageRequestInfo - Necessary information for inserting a message into the database.
 * @returns {Promise<boolean>} A promise that resolves to true if the operation succeeds, or false if the operation fails.
 */
export async function insertMessage(
    newMessageDetails: NewMessageDetails,
    client = pgClient
): Promise<boolean> {
    const query = `
        INSERT INTO ${MESSAGE_TABLE_NAME} (${DB_COL_CONVERSATION_ID}, ${DB_COL_SENDER_ID}, ${DB_COL_RECIPIENT_ID}, ${DB_COL_BODY}, ${DB_COL_PROVIDER_ID}, ${DB_COL_MESSAGE_TYPE}, ${DB_COL_ATTACHMENTS}, ${DB_COL_STATUS}, ${DB_COL_CREATED_AT})
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `;

    const { conversationId, senderId, recipientId, messageRequest, messagingApiResponse } =
        newMessageDetails;
    let { messageType } = newMessageDetails;

    let providerId: string | null = null;

    // typescript type guard safety. if it's sms/mms, use messaging_provider_id and existing type
    if ('type' in messageRequest) {
        // If it's an inbound message, it will have a 'messaging_provider_id'
        if (MESSAGING_PROVIDER_ID in messageRequest) {
            providerId = messageRequest.messaging_provider_id;
        }
        messageType = messageRequest.type;
    }
    // if it's email, use xillio id
    else if (XILLIO_ID in messageRequest) {
        providerId = messageRequest.xillio_id;
    }

    const values = [
        conversationId,
        senderId,
        recipientId,
        messageRequest.body,
        providerId,
        messageType,
        JSON.stringify(messageRequest.attachments || []),
        messagingApiResponse?.status,
        messageRequest.timestamp || new Date().toISOString(),
    ];

    try {
        logger.debug(
            `[insertMessage] Inserting message into messages table for conversation ID ${conversationId}.`
        );
        await client.query(query, values);
        return true;
    } catch (error) {
        logger.error(
            `[insertMessage] Error updating messages table with conversation ID ${conversationId} with error - ${error}`
        );
        return false;
    }
}

/**
 * Retrieves all messages for a given conversation ID from the database.
 * @param {string} conversationId - The ID of the conversation to retrieve messages for.
 * @param {pgClient} client - The PostgreSQL client to use for the query.
 * @returns {Promise<Message[]>} A promise that resolves to an array of Message objects, sorted in ascending order by their created_at timestamps.
 */
export const getMessagesByConversationId = async (conversationId: string, client = pgClient) => {
    const query = `
        SELECT * FROM ${MESSAGE_TABLE_NAME} WHERE ${DB_COL_CONVERSATION_ID} = $1
    `;

    logger.info(
        `[getMessagesByConversationId] Getting messages for conversation ID ${conversationId}.`
    );

    const result = await client.query(query, [conversationId]);
    const messages = result?.rows;

    // sorts the messages for full conversation history
    messages.sort((a, b) => {
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    });

    logger.info(
        `[getMessagesByConversationId] Got ${messages?.length} messages for conversation ID ${conversationId}.`
    );

    return messages;
};
