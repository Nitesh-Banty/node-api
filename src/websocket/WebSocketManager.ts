import {events} from './events';
const messageHandler = require('./handlers/messageHandler');
import userHandler from './handlers/userHandler';

import WebSocket, { Server } from 'ws';
import { IncomingMessage } from 'http';
import logger from '../utils/logger';
import { Timestamp } from 'mongodb';
import { json } from 'stream/consumers';
import { error } from 'console';

interface IWebSocketManager<T = any> {
  statusCode: number,
  data: T;
  message: string;
  success: boolean;
}

interface ClientMetadata {
  userId: string | number|null;
  clientId: string;
  joinedAt: string;
}

export class WebSocketManager {
  private wss: Server;
  private server: any;
  private clients: Map<WebSocket, ClientMetadata>;
  private metadata:ClientMetadata | undefined;

  constructor(server: any) {
    this.server = server;
    // Create WebSocket server by attaching it to the HTTP server
    this.wss = new WebSocket.Server({ server: this.server })
    // Store connected clients
    this.clients = new Map();
    this.wss.on('connection', (ws: WebSocket, req: IncomingMessage) => {
      //  map connected client metadata to socket 
      const userId = this.authenticateConnection(req);
      const clientId = Date.now().toString();
      const joinedAt=new Date().toISOString(); 
      this.metadata={userId,clientId,joinedAt}
      this.clients.set(ws,this.metadata)

      this.handleConnection(ws, req);
      this.handleMassages(ws,req);
      this.handleClose(ws);
      this.handleError(ws);
    });
    logger.info('WebSocket server initialized');
  }

  handleError(ws: WebSocket) {
    ws.on('error',(error)=>{
      console.error(`Websocket fire error for ${this.metadata.userId};`,error);
    })
  }
  handleClose(ws: WebSocket) {
    try{
       ws.on('close',()=>{
          // broadcast disconnection notification // notify to all connected clients 
          const message={
            type:'system',
            message:`user ${this.metadata?.userId} has lef the chat`,
            userId:'system',
            joinAt:''
          }
          this.broadcastMessage(message)
       })
    }catch(error){

    }
  }
  handleMassages(ws: WebSocket, req: IncomingMessage) {
    ws.on('message',(massageData)=>{
       try{
         //parse the incoming massage
         const data=JSON.parse(massageData.toString());
         // creating massage object with user metadata
         const message={
          type:'massage',
          message:data,
          userId:this.metadata?.userId,
          joinAt:new Date().toISOString()
         }
           // Broadcast the message to all clients
        this.broadcastMessage(message);
       }catch(error){

       }
    })
  }
  handleConnection(ws: WebSocket, req: IncomingMessage) {
    // create client meta data and got from request 

    if (!this.metadata.userId) {
      ws.close(4001, 'Unauthorized');
      return;
    }
    logger.info(`Client connected: ${this.metadata.clientId}`);

    ws.send(
      JSON.stringify({
        type: 'system',
        message: `Welcome! You are connected as User ${this.metadata.userId}`,
        timestamp: new Date().toISOString(),
      })
    );
    // Broadcast to all clients that a new user has joined
  this.broadcastMessage({
    type: 'system',
    message: `User ${this.metadata.userId} has joined the chat`,
    userId: 'system',
    joinAt: new Date().toISOString(),
  }, ws);
 
  }

  private authenticateConnection(req: IncomingMessage): string | null {
    return `user_${Math.floor(Math.random() * 10000)}`;
    // Production code:
    // const token = parseTokenFromRequest(req);
    // return verifyToken(token);
  }

  private broadcastMessage(message: { type: string; message: any; userId: string|number | null; joinAt: string; }|any,excludeClient:any =null) {
    const messageStr=JSON.stringify(message);
    this.clients.forEach((metadata,client)=>{
      // check if client is still connected or is not the sender
      if(client.readyState===WebSocket.OPEN && client!==excludeClient)
       client.send(messageStr)
    })
 }

  

}


// export class WebSocketManager {
//   private server: any;
//   private wss!: Server;
//   private clients: Map<WebSocket, ClientMetadata>;
//   private handlers: Record<string, (manager: WebSocketManager, ws: WebSocket, message: any) => void>;

//   constructor(server: any) {
//     this.server = server;
//     this.clients = new Map();

//     this.handlers = {
//       [events.MESSAGE]: messageHandler,
//       [events.USER_JOIN]: userHandler.handleJoin,
//       [events.USER_LEAVE]: userHandler.handleLeave,
//     };
//   }

//   init(): void {
//     this.wss = new Server({ server: this.server });

//     this.wss.on('connection', (ws: WebSocket, req: IncomingMessage) => {
//       this.handleConnection(ws, req);
//     });

//     logger.info('WebSocket server initialized');
//   }

//   private handleConnection(ws: WebSocket, req: IncomingMessage): void {
//     const userId = this.authenticateConnection(req);

//     if (!userId) {
//       ws.close(4001, 'Unauthorized');
//       return;
//     }

//     const clientId = Date.now().toString();
//     const metadata: ClientMetadata = {
//       userId,
//       clientId,
//       joinedAt: new Date().toISOString(),
//     };

//     this.clients.set(ws, metadata);
//     logger.info(`Client connected: ${clientId}`);
//     console.log(`Client connected: ${clientId}`);

//     ws.send(
//       JSON.stringify({
//         type: events.SERVER,
//         message: 'Welcome to the chat API',
//         timestamp: new Date().toISOString(),
//       })
//     );

//     this.broadcastToAll(
//       {
//         type: events.USER_JOIN,
//         userId: metadata.userId,
//         timestamp: new Date().toISOString(),
//       },
//       ws
//     );

//     ws.on('message', (data: WebSocket.RawData) => this.handleMessage(ws, data));
//     ws.on('close', () => this.handleClose(ws));
//     ws.on('error', (error: Error) => this.handleError(ws, error));

//     userHandler.handleJoin(this, ws, { userId: metadata.userId });
//   }

//   private authenticateConnection(req: IncomingMessage): string | null {
//     return `user_${Math.floor(Math.random() * 10000)}`;

//     // Production code:
//     // const token = parseTokenFromRequest(req);
//     // return verifyToken(token);
//   }

//   private handleMessage(ws: WebSocket, data: WebSocket.RawData): void {
//     try {
//       const message = JSON.parse(data.toString());
//       const metadata = this.clients.get(ws);

//       if (!metadata) {
//         logger.warn('Message from unknown client');
//         return;
//       }
//        const {userId,clientId,joinedAt}= metadata
//       //message.userId = metadata.userId;
//       //message.clientId = metadata.clientId;
//       //message.timestamp = new Date().toISOString();

//      // logger.info(`Message received: ${message.type} from ${metadata.userId}`);
//       console.log('-------------',message.type);
      
//       const handler = this.handlers[message.type];
//       if (handler) {
//         handler(this, ws, message);
//       } else {
//         logger.warn(`No handler for message type: ${message.type}`);
//       }
//     } catch (error) {
//       logger.error('Error processing message:', error);
//       ws.send(
//         JSON.stringify({
//           type: events.ERROR,
//           message: 'Invalid message format',
//           timestamp: new Date().toISOString(),
//         })
//       );
//     }
//   }

//   private handleClose(ws: WebSocket): void {
//     const metadata = this.clients.get(ws);
//     if (!metadata) return;

//     logger.info(`Client disconnected: ${metadata.clientId}`);

//     userHandler.handleLeave(this, ws, metadata);

//     this.broadcastToAll({
//       type: events.USER_LEAVE,
//       userId: metadata.userId,
//       timestamp: new Date().toISOString(),
//     });

//     this.clients.delete(ws);
//   }

//   private handleError(ws: WebSocket, error: Error): void {
//     const metadata = this.clients.get(ws);
//     logger.error(`WebSocket error for client ${metadata?.clientId || 'unknown'}:`, error);
//   }

//   private broadcastToAll(message: any, excludeWs: WebSocket | null = null): void {
//     const messageStr = JSON.stringify(message);
//     this.wss.clients.forEach((client) => {
//       if (client !== excludeWs && client.readyState === WebSocket.OPEN) {
//         client.send(messageStr);
//       }
//     });
//   }

//   sendToUser(userId: string, message: any): void {
//     const messageStr = JSON.stringify(message);
//     this.wss.clients.forEach((client) => {
//       const metadata = this.clients.get(client);
//       if (metadata && metadata.userId === userId && client.readyState === WebSocket.OPEN) {
//         client.send(messageStr);
//       }
//     });
//   }

//   getConnectedUsers(): string[] {
//     const users = new Set<string>();
//     this.clients.forEach((metadata) => {
//       users.add(metadata.userId);
//     });
//     return Array.from(users);
//   }
// }


