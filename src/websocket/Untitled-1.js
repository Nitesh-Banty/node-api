// Directory Structure:
//
// project-root/
// ├── src/
// │   ├── config/
// │   │   └── index.js
// │   ├── controllers/
// │   │   └── chatController.js
// │   ├── services/
// │   │   └── chatService.js
// │   ├── models/
// │   │   └── User.js
// │   ├── websocket/
// │   │   ├── WebSocketManager.js
// │   │   ├── handlers/
// │   │   │   ├── messageHandler.js
// │   │   │   └── userHandler.js
// │   │   └── events.js
// │   ├── routes/
// │   │   ├── api.js
// │   │   └── index.js
// │   ├── middleware/
// │   │   └── auth.js
// │   └── utils/
// │       └── logger.js
// ├── app.js
// ├── server.js
// └── package.json

// 1. Main Server File (server.js)
const http = require('http');
const app = require('./app');
const config = require('./src/config');
const WebSocketManager = require('./src/websocket/WebSocketManager');
const logger = require('./src/utils/logger');

// Create HTTP server
const server = http.createServer(app);

// Initialize WebSocket server
const wsManager = new WebSocketManager(server);
wsManager.init();

// Start the server
server.listen(config.port, () => {
  logger.info(`Server running on port ${config.port}`);
  logger.info(`WebSocket server is active`);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down gracefully');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

// 2. Express App (app.js)
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const routes = require('./src/routes');
const logger = require('./src/utils/logger');

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

// API routes
app.use('/api', routes.api);

// Serve static files (like the chat client)
app.use(express.static('public'));

// Catch-all route
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Resource not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(500).json({ message: 'Something went wrong' });
});

module.exports = app;

// 3. Configuration (src/config/index.js)
module.exports = {
  port: process.env.PORT || 3000,
  env: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'your-jwt-secret-key',
  corsOrigins: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : ['http://localhost:3000']
};

// 4. WebSocket Manager (src/websocket/WebSocketManager.js)
const WebSocket = require('ws');
const events = require('./events');
const messageHandler = require('./handlers/messageHandler');
const userHandler = require('./handlers/userHandler');
const logger = require('../utils/logger');

class WebSocketManager {
  constructor(server) {
    this.server = server;
    this.clients = new Map();
    this.handlers = {
      [events.MESSAGE]: messageHandler,
      [events.USER_JOIN]: userHandler.handleJoin,
      [events.USER_LEAVE]: userHandler.handleLeave
    };
  }

  init() {
    this.wss = new WebSocket.Server({ server: this.server });
    
    this.wss.on('connection', (ws, req) => {
      this.handleConnection(ws, req);
    });
    
    logger.info('WebSocket server initialized');
  }

  handleConnection(ws, req) {
    // Parse token from query or headers for authentication
    const userId = this.authenticateConnection(req);
    
    if (!userId) {
      ws.close(4001, 'Unauthorized');
      return;
    }

    // Set up client metadata
    const clientId = Date.now().toString();
    const metadata = {
      userId,
      clientId,
      joinedAt: new Date().toISOString()
    };
    
    this.clients.set(ws, metadata);
    logger.info(`Client connected: ${clientId}`);

    // Welcome message
    ws.send(JSON.stringify({
      type: events.SERVER,
      message: 'Welcome to the chat API',
      timestamp: new Date().toISOString()
    }));

    // Notify other users
    this.broadcastToAll({
      type: events.USER_JOIN,
      userId: metadata.userId,
      timestamp: new Date().toISOString()
    }, ws);

    // Set up event handlers
    ws.on('message', (data) => this.handleMessage(ws, data));
    ws.on('close', () => this.handleClose(ws));
    ws.on('error', (error) => this.handleError(ws, error));

    // Dispatch join event
    userHandler.handleJoin(this, ws, { userId: metadata.userId });
  }

  authenticateConnection(req) {
    // In production, implement proper authentication with JWT or session
    // For this example, we're generating a random user ID
    return `user_${Math.floor(Math.random() * 10000)}`;
    
    // Production code would look something like:
    // const token = parseTokenFromRequest(req);
    // return verifyToken(token);
  }

  handleMessage(ws, data) {
    try {
      const message = JSON.parse(data);
      const metadata = this.clients.get(ws);
      
      if (!metadata) {
        logger.warn('Message from unknown client');
        return;
      }

      // Add metadata to the message
      message.userId = metadata.userId;
      message.clientId = metadata.clientId;
      message.timestamp = new Date().toISOString();

      logger.info(`Message received: ${message.type} from ${metadata.userId}`);

      // Route to appropriate handler
      const handler = this.handlers[message.type];
      if (handler) {
        handler(this, ws, message);
      } else {
        logger.warn(`No handler for message type: ${message.type}`);
      }
    } catch (error) {
      logger.error('Error processing message:', error);
      ws.send(JSON.stringify({
        type: events.ERROR,
        message: 'Invalid message format',
        timestamp: new Date().toISOString()
      }));
    }
  }

  handleClose(ws) {
    const metadata = this.clients.get(ws);
    if (!metadata) return;

    logger.info(`Client disconnected: ${metadata.clientId}`);

    // Trigger leave event
    userHandler.handleLeave(this, ws, metadata);

    // Notify other clients
    this.broadcastToAll({
      type: events.USER_LEAVE,
      userId: metadata.userId,
      timestamp: new Date().toISOString()
    });

    // Remove from clients map
    this.clients.delete(ws);
  }

  handleError(ws, error) {
    const metadata = this.clients.get(ws);
    logger.error(`WebSocket error for client ${metadata?.clientId || 'unknown'}:`, error);
  }

  broadcastToAll(message, excludeWs = null) {
    const messageStr = JSON.stringify(message);
    this.wss.clients.forEach(client => {
      if (client !== excludeWs && client.readyState === WebSocket.OPEN) {
        client.send(messageStr);
      }
    });
  }

  sendToUser(userId, message) {
    const messageStr = JSON.stringify(message);
    this.wss.clients.forEach(client => {
      const metadata = this.clients.get(client);
      if (metadata && metadata.userId === userId && client.readyState === WebSocket.OPEN) {
        client.send(messageStr);
      }
    });
  }

  getConnectedUsers() {
    const users = new Set();
    this.clients.forEach(metadata => {
      users.add(metadata.userId);
    });
    return Array.from(users);
  }
}

module.exports = WebSocketManager;

// 5. WebSocket Events (src/websocket/events.js)
module.exports = {
  // Client -> Server events
  MESSAGE: 'message',
  USER_JOIN: 'user_join',
  USER_LEAVE: 'user_leave',
  TYPING: 'typing',
  READ_RECEIPT: 'read_receipt',
  
  // Server -> Client events
  SERVER: 'server',
  ERROR: 'error',
  USER_LIST: 'user_list'
};

// 6. Message Handler (src/websocket/handlers/messageHandler.js)
const events = require('../events');
const chatService = require('../../services/chatService');
const logger = require('../../utils/logger');

module.exports = async (wsManager, ws, message) => {
  try {
    // Validate message
    if (!message.content || typeof message.content !== 'string') {
      ws.send(JSON.stringify({
        type: events.ERROR,
        message: 'Invalid message content',
        timestamp: new Date().toISOString()
      }));
      return;
    }

    // Process message (e.g., filter profanity, parse commands, etc.)
    const processedMessage = await chatService.processMessage(message);
    
    // Broadcast to all or specific room/user
    if (message.roomId) {
      // Room-specific message
      wsManager.broadcastToRoom(message.roomId, {
        type: events.MESSAGE,
        userId: message.userId,
        content: processedMessage.content,
        roomId: message.roomId,
        timestamp: message.timestamp
      });
      
      // Save message to database via service
      await chatService.saveMessage(message);
    } else if (message.toUserId) {
      // Direct message
      wsManager.sendToUser(message.toUserId, {
        type: events.MESSAGE,
        userId: message.userId,
        content: processedMessage.content,
        private: true,
        timestamp: message.timestamp
      });
      
      // Also send to the sender for confirmation
      ws.send(JSON.stringify({
        type: events.MESSAGE,
        userId: message.userId,
        toUserId: message.toUserId,
        content: processedMessage.content,
        private: true,
        sent: true,
        timestamp: message.timestamp
      }));
      
      // Save private message
      await chatService.savePrivateMessage(message);
    } else {
      // Global message
      wsManager.broadcastToAll({
        type: events.MESSAGE,
        userId: message.userId,
        content: processedMessage.content,
        timestamp: message.timestamp
      });
      
      // Save global message
      await chatService.saveGlobalMessage(message);
    }
  } catch (error) {
    logger.error('Error handling message:', error);
    ws.send(JSON.stringify({
      type: events.ERROR,
      message: 'Error processing your message',
      timestamp: new Date().toISOString()
    }));
  }
};

// 7. User Handler (src/websocket/handlers/userHandler.js)
const events = require('../events');
const logger = require('../../utils/logger');

const handleJoin = (wsManager, ws, data) => {
  const users = wsManager.getConnectedUsers();
  
  // Send user list to the new user
  ws.send(JSON.stringify({
    type: events.USER_LIST,
    users,
    timestamp: new Date().toISOString()
  }));
  
  logger.info(`User ${data.userId} joined. Total users: ${users.length}`);
};

const handleLeave = (wsManager, ws, data) => {
  logger.info(`User ${data.userId} left`);
};

module.exports = {
  handleJoin,
  handleLeave
};

// 8. Chat Service (src/services/chatService.js)
const logger = require('../utils/logger');

class ChatService {
  async processMessage(message) {
    // In a real app, this might:
    // - Filter profanity
    // - Process commands (if messages start with /)
    // - Format message (markdown, emojis, etc.)
    // - Handle mentions (@username)
    
    // For this example, just pass through
    return {
      ...message,
      processed: true
    };
  }

  async saveMessage(message) {
    // In a real app, this would save to a database
    logger.info(`Saved message from ${message.userId} in room ${message.roomId}`);
    return true;
  }

  async savePrivateMessage(message) {
    logger.info(`Saved private message from ${message.userId} to ${message.toUserId}`);
    return true;
  }

  async saveGlobalMessage(message) {
    logger.info(`Saved global message from ${message.userId}`);
    return true;
  }

  async getMessageHistory(options) {
    // In a real app, this would retrieve from a database
    return [];
  }
}

module.exports = new ChatService();

// 9. REST API Routes (src/routes/api.js)
const express = require('express');
const chatController = require('../controllers/chatController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Chat history endpoints
router.get('/messages', authMiddleware, chatController.getMessages);
router.get('/messages/:roomId', authMiddleware, chatController.getRoomMessages);
router.get('/messages/private/:userId', authMiddleware, chatController.getPrivateMessages);

// User management
router.get('/users/online', authMiddleware, chatController.getOnlineUsers);

// Room management
router.get('/rooms', authMiddleware, chatController.getRooms);
router.post('/rooms', authMiddleware, chatController.createRoom);
router.post('/rooms/:roomId/join', authMiddleware, chatController.joinRoom);
router.post('/rooms/:roomId/leave', authMiddleware, chatController.leaveRoom);

module.exports = router;

// 10. API Routes Index (src/routes/index.js)
const api = require('./api');

module.exports = {
  api
};

// 11. Chat Controller (src/controllers/chatController.js)
const chatService = require('../services/chatService');

const getMessages = async (req, res) => {
  try {
    const messages = await chatService.getMessageHistory({
      limit: req.query.limit || 50,
      before: req.query.before
    });
    
    res.json({ messages });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
};

const getRoomMessages = async (req, res) => {
  try {
    const messages = await chatService.getMessageHistory({
      roomId: req.params.roomId,
      limit: req.query.limit || 50,
      before: req.query.before
    });
    
    res.json({ messages });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch room messages' });
  }
};

const getPrivateMessages = async (req, res) => {
  try {
    const messages = await chatService.getMessageHistory({
      userId: req.user.id,
      withUserId: req.params.userId,
      limit: req.query.limit || 50,
      before: req.query.before
    });
    
    res.json({ messages });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch private messages' });
  }
};

const getOnlineUsers = (req, res) => {
  // This would interact with the WebSocket manager
  // For demonstration purposes, returning a placeholder
  res.json({ users: [] });
};

const getRooms = (req, res) => {
  // This would come from a database
  res.json({ rooms: [] });
};

const createRoom = (req, res) => {
  // Create a new chat room
  res.status(201).json({ room: { id: 'new-room-id', name: req.body.name } });
};

const joinRoom = (req, res) => {
  res.json({ success: true });
};

const leaveRoom = (req, res) => {
  res.json({ success: true });
};

module.exports = {
  getMessages,
  getRoomMessages,
  getPrivateMessages,
  getOnlineUsers,
  getRooms,
  createRoom,
  joinRoom,
  leaveRoom
};

// 12. Auth Middleware (src/middleware/auth.js)
const jwt = require('jsonwebtoken');
const config = require('../config');

module.exports = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, config.jwtSecret);
    
    // Add user info to request
    req.user = decoded;
    
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

// 13. Logger Utility (src/utils/logger.js)
const winston = require('winston');
const config = require('../config');

const logger = winston.createLogger({
  level: config.env === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

module.exports = logger;

// 14. User Model (src/models/User.js)
// In a real app, this would be a database model (Mongoose, Sequelize, etc.)
class User {
  constructor(id, username, email) {
    this.id = id;
    this.username = username;
    this.email = email;
    this.lastSeen = new Date();
    this.isOnline = false;
  }
  
  static findById(id) {
    // This would query the database
    return null;
  }
}

module.exports = User;