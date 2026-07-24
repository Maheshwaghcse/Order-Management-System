import { Server } from 'socket.io';

let io = null;

export const initSocket = (httpServer, clientUrl) => {
  io = new Server(httpServer, {
    cors: {
      origin: clientUrl || '*',
      methods: ['GET', 'POST', 'PATCH'],
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  io.on('connection', (socket) => {
    console.log(`[Socket.IO] Client connected: ${socket.id}`);

    // Join store specific room
    socket.on('join:store', (storeId) => {
      if (storeId) {
        const room = `store:${storeId}`;
        socket.join(room);
        console.log(`[Socket.IO] Socket ${socket.id} joined room ${room}`);
      }
    });

    // Leave store specific room
    socket.on('leave:store', (storeId) => {
      if (storeId) {
        const room = `store:${storeId}`;
        socket.leave(room);
        console.log(`[Socket.IO] Socket ${socket.id} left room ${room}`);
      }
    });

    socket.on('disconnect', (reason) => {
      console.log(`[Socket.IO] Client disconnected (${socket.id}): ${reason}`);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.IO has not been initialized!');
  }
  return io;
};

export const emitOrderCreated = (order) => {
  if (!io) return;
  // Broadcast to global feed
  io.emit('order:created', order);

  // Broadcast to specific store room
  if (order.store_id) {
    io.to(`store:${order.store_id}`).emit('order:created:store', order);
  }
};

export const emitOrderUpdated = (order) => {
  if (!io) return;
  // Broadcast to global feed
  io.emit('order:updated', order);

  // Broadcast to specific store room
  if (order.store_id) {
    io.to(`store:${order.store_id}`).emit('order:updated:store', order);
  }
};
