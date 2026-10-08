import { Server } from 'socket.io';
import { User } from '../models/User.js';
import { ensureParticipant, sendMessage } from '../services/conversation.service.js';

export const setupSocketServer = (httpServer, sessionMiddleware, clientUrl) => {
  const io = new Server(httpServer, {
    cors: { origin: clientUrl, credentials: true }
  });

  io.engine.use(sessionMiddleware);
  io.use(async (socket, next) => {
    try {
      const userId = socket.request.session?.passport?.user;
      if (!userId) return next(new Error('Authentication required.'));
      const user = await User.findById(userId).select('_id name');
      if (!user) return next(new Error('Authentication required.'));
      socket.userId = user.id;
      next();
    } catch (error) {
      next(error);
    }
  });

  io.on('connection', (socket) => {
    socket.on('joinConversation', async (conversationId, callback) => {
      try {
        await ensureParticipant(conversationId, socket.userId);
        socket.join(`conversation:${conversationId}`);
        callback?.({ success: true });
      } catch (error) {
        callback?.({ success: false, message: error.message });
      }
    });

    socket.on('leaveConversation', (conversationId) => {
      socket.leave(`conversation:${conversationId}`);
    });

    socket.on('sendMessage', async ({ conversationId, text }, callback) => {
      try {
        if (typeof text !== 'string' || !text.trim()) throw new Error('Message text is required.');
        const message = await sendMessage(conversationId, socket.userId, text.trim());
        io.to(`conversation:${conversationId}`).emit('newMessage', message);
        callback?.({ success: true, data: message });
      } catch (error) {
        callback?.({ success: false, message: error.message });
      }
    });

    socket.on('typing:start', (conversationId) => {
      socket.to(`conversation:${conversationId}`).emit('typing:start', { userId: socket.userId });
    });

    socket.on('typing:stop', (conversationId) => {
      socket.to(`conversation:${conversationId}`).emit('typing:stop', { userId: socket.userId });
    });
  });

  return io;
};