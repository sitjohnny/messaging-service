import { CONVERSATION_TABLE_NAME, DB_COL_CONVERSATION_ID } from '../../../db/dbConstants.ts';
import { pgClient } from '../../../db/pgClient.ts';
import logger from '../../../logger/logger.ts';

/**
 * Creates a new conversation in the conversations table and returns the generated conversation ID.
 * If the operation fails, logs an error and returns 0.
 * @param {pgClient} client - The PostgreSQL client to use for the query.
 * @returns {Promise<number>} A promise that resolves to the newly created conversation ID if the operation succeeds, or 0 if the operation fails.
 */
export async function createNewConversation(client = pgClient) {
    const query = `INSERT INTO ${CONVERSATION_TABLE_NAME} DEFAULT VALUES RETURNING ${DB_COL_CONVERSATION_ID}`;
    try {
        const res = await client.query(query);
        return res?.rows[0]?.conversation_id;
    } catch (error) {
        logger.error(`Error creating new conversation: ${error}`);
        return 0;
    }
}

/**
 * Retrieves all conversation IDs from the database.
 * @param {any} client - The PostgreSQL client to use for the query.
 * @returns {Promise<number[]>} A promise that resolves to an array of conversation IDs or an empty array if the query fails.
 */
export async function getAllConversationIds(client = pgClient) {
    logger.info('[getAllConversationIds] Getting all conversations from the database.');
    const result = await client.query(
        `SELECT ${DB_COL_CONVERSATION_ID} FROM ${CONVERSATION_TABLE_NAME}`
    );
    logger.info(`Retrieved ${result?.rows?.length} conversations from the database.`);

    if (result?.rows?.length) {
        return result?.rows?.map((row) => row.conversation_id);
    }

    return [];
}
