import { runTransaction } from '../../db/pgClient.ts';
import logger from '../../logger/logger.ts';
import type { EmailApiResponse } from '../../mocks/responses/emailSentResponses.ts';
import type { TwilioApiResponse } from '../../mocks/responses/smsMmsSentResponse.ts';
import type { InboundEmailRequest, OutboundEmailRequest } from '../../models/EmailProvider.ts';
import type { InboundSmsMmsRequest, OutboundSmsMmsRequest } from '../../models/SmsMmsProvider.ts';
import { getOrCreateConversation } from './util/conversationParticipantsUtil.ts';
import { insertMessage, type NewMessageDetails } from './util/messagesUtil.ts';
import getOrCreateUser from './util/usersUtil.ts';

/**
 * Updates the SMS tables with a new message based on the given outbound SMS/MMS request and Twilio API response.
 * This function performs the following steps:
 * 1. Ensures both sender and recipient exist in sms_users table and gets their IDs. Creates new users if they don't exist.
 * 2. Creates or gets existing conversation between the two users.
 * 3. If it's a new conversation, adds both users as participants. Otherwise, skips this step.
 * 4. Inserts the message into the sms_messages table linking it to the conversation and both users.
 * @param messageRequest - The request to send an SMS/MMS or email message.
 * @param {TwilioApiResponse} twilioApiResponse - The response from the Twilio API after sending the message.
 * @returns {Promise<boolean>} A promise that resolves to true if the operation succeeds, or false if the operation fails at any step.
 */
// TODO: Implement retry logic or dead-letter queue for failed DB operations
export default async function writeDbMessageEvent(
    messageRequest:
        | InboundSmsMmsRequest
        | InboundEmailRequest
        | OutboundSmsMmsRequest
        | OutboundEmailRequest,
    messageType: string,
    providerResp?: TwilioApiResponse | EmailApiResponse
): Promise<boolean> {
    try {
        await runTransaction(async (client) => {
            logger.debug(
                `Writing DB message event for ${messageRequest.from} -> ${messageRequest.to}`
            );
            // get or create our sender/receiver users
            const senderId = await getOrCreateUser(messageRequest.from, messageType, client);

            if (!senderId)
                throw new Error(`Failed to resolve sender user for ${messageRequest.from}`);

            const recipientId = await getOrCreateUser(messageRequest.to, messageType, client);
            if (!recipientId)
                throw new Error(`Failed to resolve recipient user for ${messageRequest.to}`);

            // get the conversation id or create a new conversation id between the users
            const conversationId = await getOrCreateConversation(
                senderId,
                recipientId,
                messageRequest,
                client
            );

            if (!conversationId)
                throw new Error(
                    `Failed to resolve conversation between ${messageRequest.from} and ${messageRequest.to}`
                );

            // combine all the details to create a new message
            const messageRequestInfo: NewMessageDetails = {
                conversationId,
                senderId,
                recipientId,
                messageRequest,
                messageType,
                messagingApiResponse: providerResp ?? null,
            };

            const success = await insertMessage(messageRequestInfo, client);

            if (!success)
                throw new Error(
                    `Failed to insert message into messages table for ${messageRequest.from} -> ${messageRequest.to}`
                );
        });

        logger.info(
            `[writeDbMessageEvent] processed message ${messageRequest.from} -> ${messageRequest.to}`
        );
        return true;
    } catch (err) {
        logger.error(
            `[writeDbMessageEvent] Failed storing message ${messageRequest.from} -> ${messageRequest.to}: ${err}`
        );
        return false;
    }
}
