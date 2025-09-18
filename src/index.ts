// index.ts
import express, { Express } from 'express';
import BaseRouter from './routes/baseRouter.ts';
import OutboundMessagingRouter from './routes/outboundMessagingRouter.ts';
import WebhooksRouter from './routes/webhooksRouter.ts';
import ConversationsRouter from './routes/conversationsRouter.ts';
import config from './config/config.ts';
import { requestLoggerMiddleware } from './middleware/middleware.ts';
import pool from './db/db.ts';

const app: Express = express();
const port = config.port;

app.use(requestLoggerMiddleware);

app.use(express.json());
app.use('/', BaseRouter);
app.use('/api/messages/', OutboundMessagingRouter);
app.use('/api/webhooks/', WebhooksRouter);
app.use('/api/conversations/', ConversationsRouter);

export default app;

// Start the server only if the file is not for testing
if (process.env.NODE_ENV !== 'test') {
    app.listen(port, async () => {
        // Test the database connection
        const result = await pool.query('SELECT NOW()');
        console.log(`Database connected: ${result.rows[0].now}`); // Log the result of the test query
        console.log(`Server listening on port ${port}...`);
    });
}
