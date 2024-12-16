const socketIo = require('socket.io');

module.exports = (server) => {
  const io = socketIo(server, {
    cors: {
      origin: 'https://67602dc432b0a03f5a4c218f--frolicking-heliotrope-4d6cff.netlify.app/', // Your frontend URL
      methods: ['GET', 'POST'],
      allowedHeaders: ['Content-Type'],
    },
  });

  io.on('connection', (socket) => {
    console.log('user connected');

    socket.on('sendMessage', (data) => {
      io.emit('newMessage', data);
    });

    socket.on('disconnect', () => {
      console.log('User disconnected');
    });
  });
};
