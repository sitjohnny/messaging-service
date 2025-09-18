import winston from 'winston';
import { getRequestUuid } from '../context/requestContext.ts';

// Extend the Express Request interface to include the uuid property
// This uses module augmentation, which is the preferred way to extend types
declare module 'express-serve-static-core' {
    interface Request {
        uuid: string;
    }
}

// Configure the Winston logger
const logger = winston.createLogger({
    level: 'info', // Set the default log level
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf((info) => {
            // Get uuid from context if not present in info
            const uuid = info.uuid || getRequestUuid();
            const { timestamp, message } = info;
            const logMessage = `[${timestamp}] messaging-service [${info.level}][correlationId: ${uuid}]: msg=${message}`;
            return logMessage;
        }),
        winston.format.errors({ stack: true }),
        winston.format.colorize({ all: true })
    ),
    transports: [new winston.transports.Console()],
});

export default logger;
