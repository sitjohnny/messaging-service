import { Router } from 'express';
import type { Request, Response } from 'express';
import { sendSmsMessage } from '../controllers/smsMmsController.ts';
import { sendEmail } from '../controllers/emailController.ts';

const router = Router();

router.get('/', (req: Request, res: Response) => {
    res.status(200).send('Outbound Messaging service is running');
});

router.post('/sms', sendSmsMessage);

router.post('/email', sendEmail);

export default router;
