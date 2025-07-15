//E:\pro-book-marketplace\backend\controllers\chatController.js

import asyncHandler from 'express-async-handler';
import Chat from '../models/chatModel.js';
import Book from '../models/bookModel.js';
import Message from '../models/messageModel.js';

export const accessChat = asyncHandler(async (req, res) => {
  const { bookId } = req.body;
  const buyerId = req.user._id;
  const book = await Book.findById(bookId);
  if (!book) { res.status(404); throw new Error('Book not found'); }
  const sellerId = book.user;
  if (buyerId.equals(sellerId)) { res.status(400); throw new Error("You can't chat about your own book."); }

  let chat = await Chat.findOne({ book: bookId, participants: { $all: [buyerId, sellerId] } });
  if (!chat) {
    chat = await Chat.create({ book: bookId, participants: [buyerId, sellerId] });
  }
  const fullChat = await Chat.findById(chat._id).populate('participants', 'name email firebaseUid');
  res.status(200).json(fullChat);
});

export const getUserChats = asyncHandler(async (req, res) => {
  const chats = await Chat.find({ participants: req.user._id })
    .populate('participants', 'name email firebaseUid')
    .populate('book', 'title imageUrls')
    .populate({ path: 'lastMessage', populate: { path: 'sender', select: 'name' } })
    .sort({ updatedAt: -1 });
  res.status(200).json(chats);
});

export const getChatById = asyncHandler(async (req, res) => {
    const chat = await Chat.findById(req.params.chatId)
        .populate('participants', 'name email firebaseUid')
        .populate('book', 'title imageUrls');
    if (!chat) { res.status(404); throw new Error('Chat not found'); }
    res.json(chat);
});

export const getChatMessages = asyncHandler(async (req, res) => {
  const messages = await Message.find({ chat: req.params.chatId })
    .populate('sender', 'name email firebaseUid');
  res.json(messages);
});