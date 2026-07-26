import { Server } from 'socket.io';

let io = null;

export const initSocket = (httpServer, clientUrls) => {
  const envOrigins = typeof clientUrls === 'string'
    ? clientUrls.split(',').map((url) => url.trim()).filter(Boolean)
    : Array.isArray(clientUrls)
    ? clientUrls
    : [];

  const defaultOrigins = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'https://order-management-system-beryl-alpha.vercel.app',
    'https://order-management-system-42rfgu5jn-mahesh-wagh-s-projects.vercel.app',
  ];

  const allowedOrigins = Array.from(new Set([...defaultOrigins, ...envOrigins]));

  io = new Server(httpServer, {
    cors: {
      origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        const normalizedOrigin = origin.replace(/\/$/, '');
        const isAllowed =
          allowedOrigins.some((allowed) => allowed.replace(/\/$/, '') === normalizedOrigin) ||
          normalizedOrigin.endsWith('.vercel.app');

        if (isAllowed) {
          return callback(null, true);
        }
        return callback(new Error(`Socket.IO CORS blocked for origin: ${origin}`));
      },
      methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
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
