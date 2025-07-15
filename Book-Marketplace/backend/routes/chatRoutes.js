//E:\pro-book-marketplace\backend\routes\chatRoutes.js
import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { accessChat, getUserChats, getChatById, getChatMessages } from '../controllers/chatController.js';

const router = express.Router();
router.use(protect);

router.route('/').post(accessChat).get(getUserChats);
router.route('/:chatId').get(getChatById);
router.route('/:chatId/messages').get(getChatMessages);

export default router;