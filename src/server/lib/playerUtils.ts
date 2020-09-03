export const playerID = (socket: SocketIO.Socket): string =>
  socket.handshake.session.id;
