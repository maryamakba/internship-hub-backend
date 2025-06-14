const Message = require('./models/Message');

const activeUsers = {};

function socketHandler(io) {
  io.on('connection', (socket) => {
    console.log('📡 New client connected:', socket.id);

    socket.on('join', (userId) => {
      activeUsers[userId] = socket.id;
      socket.join(userId);
      console.log(`✅ User ${userId} joined and is now active.`);
    });

    socket.on('sendMessage', async ({ senderId, receiverId, content }) => {
      const message = new Message({ senderId, receiverId, content });
      await message.save();

      // Send to receiver in real-time
      const receiverSocket = activeUsers[receiverId];
      if (receiverSocket) {
        io.to(receiverSocket).emit('receiveMessage', message);
      }
    });

    socket.on('disconnect', () => {
      console.log('❌ Client disconnected:', socket.id);
      for (const userId in activeUsers) {
        if (activeUsers[userId] === socket.id) {
          delete activeUsers[userId];
          break;
        }
      }
    });
  });
}

module.exports = socketHandler;
