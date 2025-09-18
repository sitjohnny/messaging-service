import { Router } from 'express';
import { getAllConversations, getMessages } from '../controllers/conversationsController.ts';

const router = Router();

router.get('/', getAllConversations);
router.get('/:conversationId/messages', getMessages);

export default router;
