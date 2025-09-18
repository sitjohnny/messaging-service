// db table names
export const USER_TABLE_NAME = 'users';
export const CONVERSATION_TABLE_NAME = 'conversations';
export const CONVERSATION_PARTICIPANT_TABLE_NAME = 'conversation_participants';
export const MESSAGE_TABLE_NAME = 'messages';

// common column names
export const DB_COL_USER_ID = 'user_id';
export const DB_COL_CONVERSATION_ID = 'conversation_id';
export const DB_COL_CREATED_AT = 'created_at';

export const USER_COLUMN_NAMES = {
    DB_COL_PHONE_NUMBER: 'phone_number',
    DB_COL_EMAIL: 'email',
};

export const MESSAGE_COLUMN_NAMES = {
    DB_COL_MESSAGE_ID: 'message_id',
    DB_COL_SENDER_ID: 'sender_id',
    DB_COL_RECIPIENT_ID: 'recipient_id',
    DB_COL_BODY: 'body',
    DB_COL_PROVIDER_ID: 'provider_id',
    DB_COL_MESSAGE_TYPE: 'message_type',
    DB_COL_ATTACHMENTS: 'attachments',
    DB_COL_STATUS: 'status',
};
