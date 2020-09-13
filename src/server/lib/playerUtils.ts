export const getPlayerID = (socket: SocketIO.Socket): string =>
  socket.handshake.session.id;
