import { Server, Socket } from 'socket.io';
import { getDbClient } from '../db/index.js';

export class SocketService {
  private io: Server;
  // Map userId -> socketId (for easy lookup)
  private userSocketMap = new Map<string, string>();
  // Map socketId -> userId (for disconnects)
  private socketToUserMap = new Map<string, string>();

  constructor(io: Server) {
    this.io = io;
  }

  initialize() {
    this.io.on('connection', (socket: Socket) => {
      console.log(`New socket connection: ${socket.id} from ${socket.handshake.address}`);

      socket.on('set_user', (data: { userId: string }) => {
        if (data.userId) {
          this.handleUserIdentification(socket, data.userId);
        }
      });

      socket.on('join_lobby_room', (data: { lobbyId: string; userId: string }) => {
        if (data.lobbyId && data.userId) {
          socket.join(data.lobbyId);
          this.handleUserIdentification(socket, data.userId);
          console.log(`User ${data.userId} joined lobby room ${data.lobbyId}`);
        }
      });

      socket.on('disconnect', (reason) => {
        this.handleDisconnect(socket, reason);
      });
    });
  }

  private handleUserIdentification(socket: Socket, userId: string) {
    // Cleanup any old socket this user might have had (prevent ghost connections)
    const oldSocketId = this.userSocketMap.get(userId);
    if (oldSocketId && oldSocketId !== socket.id) {
      this.socketToUserMap.delete(oldSocketId);
      const oldSocket = this.io.sockets.sockets.get(oldSocketId);
      if (oldSocket) oldSocket.disconnect(true);
    }

    this.userSocketMap.set(userId, socket.id);
    this.socketToUserMap.set(socket.id, userId);
    console.log(`User ${userId} identified on socket ${socket.id}`);
  }

  private async handleDisconnect(socket: Socket, reason: string) {
    console.log(`Socket disconnected: ${socket.id}. Reason: ${reason}`);
    const userId = this.socketToUserMap.get(socket.id);

    // 1. Remove from maps
    this.socketToUserMap.delete(socket.id);
    if (userId) {
      if (this.userSocketMap.get(userId) === socket.id) {
        this.userSocketMap.delete(userId);
      }
    }

    // 2. Database cleanup for lobbies
    if (userId) {
      await this.cleanupUserLobbies(userId);
    }
  }

  private async cleanupUserLobbies(userId: string) {
    try {
      const client = await getDbClient();
      // Find if this player was in any lobby
      const res = await client.query('SELECT lobby_id FROM lobby_players WHERE user_id = $1', [
        userId,
      ]);

      if (res.rows.length > 0) {
        const lobbyId = res.rows[0].lobby_id;
        // Delete player from lobby
        await client.query('DELETE FROM lobby_players WHERE user_id = $1', [userId]);

        // Reassign host if needed
        await this.handleHostSuccession(client, lobbyId, userId);

        // Notify other players
        this.io.to(lobbyId).emit('player_left', { userId });
        console.log(`Cleaned up user ${userId} from lobby ${lobbyId} on disconnect`);
      }
      client.release();
    } catch (e) {
      console.error('Error cleaning up lobby on disconnect:', e);
    }
  }

  private async handleHostSuccession(client: any, lobbyId: string, leavingUserId: string) {
    const lobbyCheck = await client.query('SELECT host_id FROM lobbies WHERE id = $1', [lobbyId]);

    if (lobbyCheck.rows.length > 0 && lobbyCheck.rows[0].host_id === leavingUserId) {
      const nextPlayer = await client.query(
        'SELECT user_id FROM lobby_players WHERE lobby_id = $1 ORDER BY joined_at ASC LIMIT 1',
        [lobbyId],
      );

      if (nextPlayer.rows.length > 0) {
        const newHostId = nextPlayer.rows[0].user_id;
        await client.query('UPDATE lobbies SET host_id = $1 WHERE id = $2', [newHostId, lobbyId]);
        this.io.to(lobbyId).emit('host_transferred', { newHostId });
        console.log(`Host transferred from ${leavingUserId} to ${newHostId} in lobby ${lobbyId}`);
      } else {
        // Last player left - delete the lobby
        await client.query('DELETE FROM lobbies WHERE id = $1', [lobbyId]);
        console.log(
          `Lobby ${lobbyId} deleted because the host (and last player) ${leavingUserId} left.`,
        );
      }
    } else {
      // If not host, still check if empty
      const remaining = await client.query(
        'SELECT COUNT(*) FROM lobby_players WHERE lobby_id = $1',
        [lobbyId],
      );
      if (parseInt(remaining.rows[0].count) === 0) {
        await client.query('DELETE FROM lobbies WHERE id = $1', [lobbyId]);
        console.log(`Lobby ${lobbyId} deleted because the last player ${leavingUserId} left.`);
      }
    }
  }

  getDebugState() {
    const connectionDetails: any[] = [];
    for (const [socketId, socket] of this.io.sockets.sockets.entries()) {
      const userId = this.socketToUserMap.get(socketId);
      const subscribedRooms = Array.from(socket.rooms).filter((room) => room !== socket.id);
      connectionDetails.push({
        socketId,
        userId: userId || null,
        rooms: subscribedRooms,
      });
    }

    return {
      connectedUsers: Array.from(this.userSocketMap.keys()),
      connectionDetails,
    };
  }

  getIo() {
    return this.io;
  }
}
