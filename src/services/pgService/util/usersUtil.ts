import logger from '../../../logger/logger.ts';
import pgClient from '../../../db/db.ts';
import { USER_COLUMN_NAMES, USER_TABLE_NAME, DB_COL_USER_ID } from '../../../db/dbConstants.ts';
const { DB_COL_PHONE_NUMBER, DB_COL_EMAIL } = USER_COLUMN_NAMES;

/**
 * Checks if a user with the given phone number/email already exists in the sms_users table.
 * If they do, returns their user ID.
 * If not, creates a new user and returns their user ID.
 * @param {string} senderInfo - The phone number/email to check for.
 * @param {string} messageType - The type of message of the request.
 * @returns {Promise<number | boolean>} A promise that resolves to the user ID if they exist or were created, or false if the operation failed.
 */
async function getOrCreateUser(
    senderInfo: string,
    messageType: string,
    client = pgClient
): Promise<number> {
    logger.debug(
        `[getOrCreateUser] Getting or creating user with phone number/email: ${senderInfo}.`
    );
    let userId = await getUserId(senderInfo, client);
    if (userId) {
        return userId;
    }

    logger.debug(`[getOrCreateUser] No existing user found. Creating new user.`);
    userId = await createUser(senderInfo, messageType, client);
    return userId;
}

async function getUserId(senderInfo: string, client = pgClient): Promise<number> {
    const query = `SELECT ${DB_COL_USER_ID} FROM ${USER_TABLE_NAME} WHERE ${DB_COL_PHONE_NUMBER} = $1 OR ${DB_COL_EMAIL} = $1 LIMIT 1;`;

    try {
        logger.debug(`[getUserId] Retrieving user by phone number/email: ${senderInfo}.`);
        const res = await client.query(query, [senderInfo]);
        if (res.rows.length > 0) {
            logger.debug(`[getUserId] Found user with phone number/email: ${senderInfo}.`);
            return res.rows[0].user_id;
        } else {
            logger.debug(`[getUserId] No user found with phone number/email: ${senderInfo}.`);
            return 0;
        }
    } catch (error) {
        logger.error(
            `[getUserId] Error retrieving user by phone number/email: ${senderInfo}: ${error}`
        );
        return 0;
    }
}

async function createUser(
    senderInfo: string,
    messageType: string,
    client = pgClient
): Promise<number> {
    const query = `INSERT INTO ${USER_TABLE_NAME} (${messageType}) VALUES ($1) RETURNING ${DB_COL_USER_ID}`;

    try {
        logger.debug(`[createUser] Creating user with phone number/email: ${senderInfo}.`);
        const res = await client.query(query, [senderInfo]);
        return res.rows[0].user_id;
    } catch (error) {
        logger.error(
            `[createUser] Error creating user with phone number/email: ${senderInfo}: ${error}`
        );
        return 0;
    }
}

export default getOrCreateUser;
