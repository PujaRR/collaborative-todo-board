let io;

function initSocket(server) {
  const { Server } = require('socket.io');
  io = new Server(server, { cors: { origin: 'http://localhost:3000' } });

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('join', (userId) => {
      socket.join(userId);
      console.log(`User ${userId} joined their room`);
    });

    socket.on('joinBoard', (boardId) => {
      socket.join(`board-${boardId}`);
      console.log(`User joined board room: board-${boardId}`);
    });

    socket.on('leaveBoard', (boardId) => {
      socket.leave(`board-${boardId}`);
      console.log(`User left board room: board-${boardId}`);
    });

    socket.on('taskMoved', () => {
      console.log('Task moved event received');
    });

    socket.on('disconnect', () => console.log('User disconnected:', socket.id));
  });
}

function getIO() {
  if (!io) throw new Error('Socket not initialized');
  return io;
}

function emitToUsers(userIds, event, data) {
  userIds.forEach((userId) => {
    io.to(userId.toString()).emit(event, data);
  });
}

function emitToBoardMembers(boardId, event, data) {
  io.to(`board-${boardId}`).emit(event, data);
}

module.exports = { initSocket, getIO, emitToUsers, emitToBoardMembers };