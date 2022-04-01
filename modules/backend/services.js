const users = [];
const rooms = [];

function getRandomColor() {
  return `#${Math.floor(Math.random() * 16777215).toString(16)}`;
}

export default function startService(socket, io) {
  socket.on('newUser', (nickname) => {
    const user = {
      id: socket.id,
      nickname,
      color: getRandomColor(),
    };
    users.push(user);
    socket.emit('userAdded', user, rooms);
  });

  socket.on('createRoom', (owner, roomName) => {
    const room = {
      id: `room${Date.now().toString()}`,
      name: roomName,
      owner,
      color: getRandomColor(),
    };
    socket.join(room.id);
    rooms.push(room);
    io.emit('newRoom', room);
  });

  socket.on('roomClicked', (roomId) => {
    const sockets = io.of('/').adapter.rooms.get(roomId);
    socket.emit('isInRoom', sockets && sockets.has(socket.id));
  });

  socket.on('joinRoom', (roomId) => {
    socket.join(roomId);
    socket.emit('joinRoomComplete');
  });
}

export function startGlobalService(io) {
  io.of('/').adapter.on('create-room', (room) => {
    if (!room.startsWith('room')) {
      return;
    }
    console.log(`room created${room}`);
  });
}
