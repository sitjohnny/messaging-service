import * as z from 'zod';

const utcTimestampFormat = z.iso.datetime();
const phoneNumberFormat = z.string().regex(/^\+1\d{10}$/);

export const OutboundSmsMmsSchema = z.object({
    from: phoneNumberFormat,
    to: phoneNumberFormat,
    type: z.literal(['sms', 'mms']),
    body: z.string(),
    attachments: z.nullable(z.array(z.url()).optional()),
    timestamp: utcTimestampFormat,
});

export const InboundSmsMmsSchema = z.object({
    from: phoneNumberFormat,
    to: phoneNumberFormat,
    type: z.literal(['sms', 'mms']),
    messaging_provider_id: z.string(),
    body: z.string(),
    attachments: z.nullable(z.array(z.url()).optional()),
    timestamp: utcTimestampFormat,
});

export type OutboundSmsMmsRequest = z.infer<typeof OutboundSmsMmsSchema>;
export type InboundSmsMmsRequest = z.infer<typeof InboundSmsMmsSchema>;
