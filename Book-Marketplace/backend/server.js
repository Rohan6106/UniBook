//E:\pro-book-marketplace\backend\server.js
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import connectDB from './config/db.js';

import Message from './models/messageModel.js';
import Chat from './models/chatModel.js';
import User from './models/userModel.js';
import Book from './models/bookModel.js';

import bookRoutes from './routes/bookRoutes.js';
import chatRoutes from './routes/chatRoutes.js';

import { notFound, errorHandler } from './middleware/errorMiddleware.js';
import { sendNewMessageEmail } from './utils/sendEmail.js';

connectDB();
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  pingTimeout: 60000,
  cors: {
    origin: 'http://localhost:3000',
  },
});

const whitelist = ['http://localhost:3000'];
if (process.env.FRONTEND_URL) {
  // FRONTEND_URL will be your Vercel URL, e.g., https://my-book-app.vercel.app
  whitelist.push(process.env.FRONTEND_URL);
}

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin || whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  allowedHeaders: "Origin, X-Requested-With, Content-Type, Accept, Authorization",
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/health', (req, res) => res.send('API is healthy and running!'));
app.use('/api/books', bookRoutes);
app.use('/api/chats', chatRoutes);

io.on('connection', (socket) => {
  console.log('Socket.IO: User connected ->', socket.id);

  socket.on('join chat', (chatId) => {
    socket.join(chatId);
    console.log(`Socket.IO: User ${socket.id} joined room -> ${chatId}`);
  });

  socket.on('new message', async (newMessageData) => {
    const { chatId, text, sender } = newMessageData;
    if (!chatId || !text || !sender?._id) {
        console.error("Socket.IO: Invalid message data received", newMessageData);
        return;
    }

    try {
      const senderUserInDb = await User.findOne({ firebaseUid: sender._id });
      if (!senderUserInDb) throw new Error(`Sender with Firebase UID ${sender._id} not found in DB`);

      const messageToSave = { chat: chatId, text, sender: senderUserInDb._id };
      let createdMessage = await Message.create(messageToSave);
      
      let fullMessage = await Message.findById(createdMessage._id)
        .populate('sender', 'name email firebaseUid');

      if (!fullMessage) throw new Error("Failed to populate the created message.");

      await Chat.findByIdAndUpdate(chatId, { lastMessage: fullMessage._id });
      
      socket.to(chatId).emit('message received', fullMessage);
      console.log(`Socket.IO: Message from ${fullMessage.sender.name} broadcasted to room -> ${chatId}`);

      const chat = await Chat.findById(chatId).populate('participants');
      if (!chat) throw new Error('Chat not found for notification check');
      
      const recipientUser = chat.participants.find(
        (p) => p._id.toString() !== senderUserInDb._id.toString()
      );

      if (recipientUser) {
        const roomSockets = await io.in(chatId).fetchSockets();
        if (roomSockets.length <= 1) {
          console.log(`Recipient ${recipientUser.name} is offline. Sending email notification.`);
          
          await sendNewMessageEmail({
            to: recipientUser.email,
            fromName: senderUserInDb.name,
            bookTitle: (await Book.findById(chat.book))?.title || 'your book',
            chatLink: `http://localhost:3000/dashboard/chat/${chatId}`
          });
        } else {
          console.log(`Recipient ${recipientUser.name} is online. No email sent.`);
        }
      }
    } catch (error) {
      console.error('Socket "new message" event error:', error);
    }
  });

  socket.on('disconnect', () => {
    console.log('Socket.IO: User disconnected ->', socket.id);
  });
});

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});