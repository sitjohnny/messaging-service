import { Router } from 'express';
import type { Request, Response } from 'express';
import { receiveSmsMessage } from '../controllers/smsMmsController.ts';
import { receiveEmail } from '../controllers/emailController.ts';

const router = Router();

router.get('/', (req: Request, res: Response) => {
    res.status(200).send('Webhooks service is running');
});

router.post('/sms', receiveSmsMessage);

router.post('/email', receiveEmail);

export default router;
