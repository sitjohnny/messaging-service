import { Request, Response } from 'express';
import { ZodError } from 'zod';
import logger from '../logger/logger.ts';

export function invalidAttributesError(err: ZodError | unknown, req: Request, res: Response) {
    if (err instanceof ZodError) {
        logger.error(
            `Invalid attributes error: ${JSON.stringify(err.issues)} with Request Body:', ${JSON.stringify(req.body)}`
        );

        return res.status(400).json({
            error: 'Invalid request payload',
            details: err.issues,
        });
    }

    logger.error(`Invalid attributes error: ${err}`);
    return res.status(400).json({ error: 'Invalid request payload', details: err });
}

export function internalServerError(err: any, req: Request, res: Response) {
    logger.error(`Internal server error: ${err}`);
    res.status(500).json({ error: 'Internal Server Error', details: err?.message || err });
}

export function databaseError(err: any, req: Request, res: Response) {
    logger.error(`Database error: ${JSON.stringify(err)}`);
    res.status(500).json({ error: 'Database Error', details: err?.message || err });
}
