import { DefaultEventsMap, Server } from "socket.io";
import { createNewMessageService } from "../services/conversation.service";

export const initializeSockets = (
  io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>
) => {
  io.on("connection", (socket) => {
    socket.on("join-convo", ({ conversationId }) => {
      socket.join(conversationId);
    });

    socket.on("send-message", async ({ conversationId, message, userId }) => {
      const newMessage = await createNewMessageService(
        conversationId,
        message,
        userId
      );

      socket.to(conversationId).emit("new-message", {
        message: newMessage.text,
        sender: newMessage.sender,
        timestamp: newMessage.createdAt,
      });
    });

    socket.on("leave-convo", ({ conversationId }) => {
      socket.leave(conversationId);
    });
  });
};

export function periodicRoomCleanup(
  io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>
) {
  const rooms = io.sockets.adapter.rooms;
  const sids = io.sockets.adapter.sids;
  const emptyRooms = [];

  for (const [roomId, sockets] of rooms) {
    if (sids.has(roomId)) continue;

    if (sockets.size === 0) {
      emptyRooms.push(roomId);
    }
  }

  // Delete empty rooms
  emptyRooms.forEach((roomId) => {
    console.log(`Cleaning up empty room: ${roomId}`);
    rooms.delete(roomId);
  });

  if (emptyRooms.length > 0) {
    console.log(`Cleaned up ${emptyRooms.length} empty rooms`);
  }
}
