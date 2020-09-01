export const playerID = (socket: SocketIO.Socket) =>
  socket.handshake.session.id;
