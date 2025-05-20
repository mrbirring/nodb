// server.js
const io = require('socket.io')(3000, {
    cors: { origin: '*' }
  });
  
  io.on('connection', socket => {
    console.log('A user connected:', socket.id);
  
    socket.on('join', userId => {
      console.log(`User ${userId} joined`);
      socket.join(userId);
    });
  
    socket.on('message', ({ to, from, message }) => {
      console.log(`Message from ${from} to ${to}: ${message}`);
      io.to(to).emit('message', { from, message });
    });
  
    socket.on('disconnect', () => {
      console.log('User disconnected');
    });
  });
  