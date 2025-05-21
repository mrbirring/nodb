const PORT = process.env.PORT || 3000;

const io = require('socket.io')(PORT, {
  cors: { origin: '*' }
});

let rooms = {};

io.on('connection', socket => {
  console.log('Connected:', socket.id);

  socket.on('createRoom', roomName => {
    if (rooms[roomName]) {
      socket.emit('roomError', 'Room already exists');
      return;
    }
    rooms[roomName] = [socket.id];
    socket.join(roomName);
    socket.emit('roomCreated', roomName);
    console.log(`Room created: ${roomName}`);
  });

  socket.on('joinRoom', roomName => {
    if (!rooms[roomName]) {
      socket.emit('roomError', 'Room does not exist');
      return;
    }
    rooms[roomName].push(socket.id);
    socket.join(roomName);
    socket.emit('roomJoined', roomName);
    io.to(roomName).emit('message', { from: 'System', message: `${socket.id} joined` });
    console.log(`Socket ${socket.id} joined room: ${roomName}`);
  });

  socket.on('message', ({ roomName, from, message }) => {
    io.to(roomName).emit('message', { from, message });
    console.log(`Message to ${roomName}: ${from} - ${message}`);
  });

  socket.on('disconnect', () => {
    for (const room in rooms) {
      rooms[room] = rooms[room].filter(id => id !== socket.id);
      if (rooms[room].length === 0) delete rooms[room];
    }
    console.log('Disconnected:', socket.id);
  });
});
