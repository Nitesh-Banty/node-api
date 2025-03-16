import logger from "../../utils/logger";
import { WebSocketManager } from "../WebSocketManager";
const events = require('../events');

const handleJoin = (wsManager:WebSocketManager, ws:WebSocket, data:any) => {
  const users = wsManager.getConnectedUsers();
  
  // Send user list to the new user
  ws.send(JSON.stringify({
    type: events.USER_LIST,
    users,
    timestamp: new Date().toISOString()
  }));
  
  logger.info(`User ${data.userId} joined. Total users: ${users.length}`);
};

const handleLeave = (wsManager:WebSocketManager, ws:WebSocket, data:any) => {
  logger.info(`User ${data.userId} left`);
};

export default{
  handleJoin,
  handleLeave
};