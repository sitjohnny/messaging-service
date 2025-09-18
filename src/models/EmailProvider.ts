import z from 'zod';

const utcTimestampFormat = z.iso.datetime();
// Supports both [user@usehatchapp.com](mailto:user@usehatchapp.com) and user@usehatchapp.com
const emailRegex = /^(\[.*\]\(mailto:)?([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})(\))?$/;
const mailtoPattern = z.string().regex(emailRegex);

export const inboundEmailRequestSchema = z.object({
    from: mailtoPattern,
    to: mailtoPattern,
    xillio_id: z.string(),
    body: z.string(),
    attachments: z.array(z.url().optional()),
    timestamp: utcTimestampFormat,
});

export const outboundEmailRequestSchema = z.object({
    from: mailtoPattern,
    to: mailtoPattern,
    body: z.string(),
    attachments: z.array(z.url().optional()),
    timestamp: utcTimestampFormat,
});

export type InboundEmailRequest = z.infer<typeof inboundEmailRequestSchema>;
export type OutboundEmailRequest = z.infer<typeof outboundEmailRequestSchema>;
