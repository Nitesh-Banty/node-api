const chatService = require('../services/chatService');

import { Request,Response } from "express";

const getMessages = async (req:Request, res:Response) => {
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

const getRoomMessages = async (req:Request, res:Response) => {
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

const getPrivateMessages = async (req:Request, res:Response)=> {
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

const getOnlineUsers = (req:Request, res:Response) => {
  // This would interact with the WebSocket manager
  // For demonstration purposes, returning a placeholder
  res.json({ users: [] });
};

const getRooms = (req:Request, res:Response) => {
  // This would come from a database
  res.json({ rooms: [] });
};

const createRoom = (req:Request, res:Response)=> {
  // Create a new chat room
  res.status(201).json({ room: { id: 'new-room-id', name: req.body.name } });
};

const joinRoom = (req:Request, res:Response) => {
  res.json({ success: true });
};

const leaveRoom = (req:Request, res:Response) => {
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
