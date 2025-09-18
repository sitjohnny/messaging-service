import pgClient from './db.ts';
export { pgClient };

/**
 * Runs a callback function inside a PostgreSQL transaction.
 * The callback function is called with the current pgClient instance as its argument.
 * If the callback function succeeds, the transaction is committed.
 * If the callback function fails, the transaction is rolled back and the error is re-thrown.
 * @template T
 * @param {((client: any) => Promise<T>)} callback - The callback function to run inside the transaction.
 * @returns {Promise<T>} A promise that resolves to the result of the callback function if the transaction succeeds, or rejects with the error if the transaction fails.
 */
export async function runTransaction<T>(callback: (client: any) => Promise<T>): Promise<T> {
    const client = pgClient;
    try {
        await client.query('BEGIN');
        const result = await callback(client);
        await client.query('COMMIT');
        return result;
    } catch (err) {
        try {
            await client.query('ROLLBACK');
        } catch (_) {}
        throw err;
    }
}
