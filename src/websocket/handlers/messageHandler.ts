import logger from "../../utils/logger";
import { WebSocketManager } from "../WebSocketManager";

const events = require('../events');
const chatService = require('../../services/chatService');

module.exports = async (wsManager:WebSocketManager, ws:WebSocket, message:any) => {
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
    //   wsManager.broadcastToRoom(message.roomId, {
    //     type: events.MESSAGE,
    //     userId: message.userId,
    //     content: processedMessage.content,
    //     roomId: message.roomId,
    //     timestamp: message.timestamp
    //   });
      
      // Save message to database via service
      await chatService.saveMessage(message);
    } else if (message.toUserId) {
      // Direct message
      // wsManager.sendToUser(message.toUserId, {
      //   type: events.MESSAGE,
      //   userId: message.userId,
      //   content: processedMessage.content,
      //   private: true,
      //   timestamp: message.timestamp
      // });
      
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
    //   wsManager.broadcastToAll({
    //     type: events.MESSAGE,
    //     userId: message.userId,
    //     content: processedMessage.content,
    //     timestamp: message.timestamp
    //   });
      
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

