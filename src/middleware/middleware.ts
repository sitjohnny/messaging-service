import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import logger from '../logger/logger.ts';
import { requestContext } from '../context/requestContext.ts';

export interface MiddlewareParams {
    req: express.Request;
    res: express.Response;
    next?: express.NextFunction;
}

/**
 * Express middleware to add a unique UUID to each request.
 * This UUID can be used for request-based tracing in logs.
 */
export const requestLoggerMiddleware = (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
) => {
    req.uuid = uuidv4();
    requestContext.run({ uuid: req.uuid }, () => {
        logger.info(`Incoming request: ${req.method} ${req.originalUrl}`);
        next();
    });
};
