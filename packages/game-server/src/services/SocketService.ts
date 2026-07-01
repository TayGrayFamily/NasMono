import { Server, Socket } from 'socket.io';
import { getDbClient } from '../db/index.js';

export class SocketService {
  private io: Server;
  // Map userId -> socketId (for easy lookup)
  private userSocketMap = new Map<string, string>();
  // Map socketId -> userId (for disconnects)
  private socketToUserMap = new Map<string, string>();
  // Map lobbyId -> Set of userIds with an active socket in that lobby room
  private lobbyPresenceMap = new Map<string, Set<string>>();

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
        if (!data.lobbyId || !data.userId) return;

        const identifiedUserId = this.socketToUserMap.get(socket.id);
        if (identifiedUserId && identifiedUserId !== data.userId) {
          console.warn(
            `Rejected join_lobby_room: socket ${socket.id} is identified as ${identifiedUserId}, not ${data.userId}`,
          );
          return;
        }

        socket.join(data.lobbyId);
        this.handleUserIdentification(socket, data.userId);
        this.trackPresence(data.lobbyId, data.userId);
        console.log(`User ${data.userId} joined lobby room ${data.lobbyId}`);
      });

      socket.on('leave_lobby_room', (data: { lobbyId: string; userId: string }) => {
        if (!data.lobbyId || !data.userId) return;

        const identifiedUserId = this.socketToUserMap.get(socket.id);
        if (identifiedUserId && identifiedUserId !== data.userId) return;

        this.untrackPresence(data.lobbyId, data.userId);
        socket.leave(data.lobbyId);
        console.log(`User ${data.userId} left lobby room ${data.lobbyId}`);
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
      this.clearPresenceForSocket(oldSocketId);
      this.socketToUserMap.delete(oldSocketId);
      const oldSocket = this.io.sockets.sockets.get(oldSocketId);
      if (oldSocket) oldSocket.disconnect(true);
    }

    this.userSocketMap.set(userId, socket.id);
    this.socketToUserMap.set(socket.id, userId);
    console.log(`User ${userId} identified on socket ${socket.id}`);
  }

  private clearPresenceForSocket(socketId: string) {
    const userId = this.socketToUserMap.get(socketId);
    if (!userId) return;

    for (const [lobbyId, users] of this.lobbyPresenceMap.entries()) {
      if (users.has(userId)) {
        this.untrackPresence(lobbyId, userId);
      }
    }
  }

  private trackPresence(lobbyId: string, userId: string) {
    if (!this.lobbyPresenceMap.has(lobbyId)) {
      this.lobbyPresenceMap.set(lobbyId, new Set());
    }
    const wasPresent = this.lobbyPresenceMap.get(lobbyId)!.has(userId);
    this.lobbyPresenceMap.get(lobbyId)!.add(userId);
    if (!wasPresent) {
      this.emitPlayerPresence(lobbyId, userId, true);
    }
  }

  private untrackPresence(lobbyId: string, userId: string) {
    const users = this.lobbyPresenceMap.get(lobbyId);
    if (!users?.has(userId)) return;

    users.delete(userId);
    if (users.size === 0) {
      this.lobbyPresenceMap.delete(lobbyId);
    }
    this.emitPlayerPresence(lobbyId, userId, false);
  }

  private emitPlayerPresence(lobbyId: string, userId: string, connected: boolean) {
    this.io.to(lobbyId).emit('player_presence', { userId, connected });
  }

  emitLobbyCreated(lobbyId: string) {
    this.io.emit('lobby_created', { lobbyId });
  }

  emitLobbyUpdated(lobbyId: string) {
    this.io.emit('lobby_updated', { lobbyId });
  }

  emitLobbyDeleted(lobbyId: string) {
    this.io.emit('lobby_deleted', { lobbyId });
  }

  getConnectedUserIdsInLobby(lobbyId: string): string[] {
    return Array.from(this.lobbyPresenceMap.get(lobbyId) ?? []);
  }

  private async handleDisconnect(socket: Socket, reason: string) {
    console.log(`Socket disconnected: ${socket.id}. Reason: ${reason}`);
    const userId = this.socketToUserMap.get(socket.id);

    this.clearPresenceForSocket(socket.id);

    // Remove from maps
    this.socketToUserMap.delete(socket.id);
    if (userId) {
      if (this.userSocketMap.get(userId) === socket.id) {
        this.userSocketMap.delete(userId);
      }
    }

    // Database cleanup for lobbies
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
        const lobbyDeleted = await this.handleHostSuccession(client, lobbyId, userId);

        // Notify other players
        this.io.to(lobbyId).emit('player_left', { userId });
        if (lobbyDeleted) {
          this.emitLobbyDeleted(lobbyId);
        } else {
          this.emitLobbyUpdated(lobbyId);
        }
        console.log(`Cleaned up user ${userId} from lobby ${lobbyId} on disconnect`);
      }
      client.release();
    } catch (e) {
      console.error('Error cleaning up lobby on disconnect:', e);
    }
  }

  private async handleHostSuccession(
    client: {
      query: (sql: string, params?: unknown[]) => Promise<{ rows: Record<string, string>[] }>;
    },
    lobbyId: string,
    leavingUserId: string,
  ): Promise<boolean> {
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
        return false;
      }

      await client.query('DELETE FROM lobbies WHERE id = $1', [lobbyId]);
      console.log(
        `Lobby ${lobbyId} deleted because the host (and last player) ${leavingUserId} left.`,
      );
      return true;
    }

    const remaining = await client.query('SELECT COUNT(*) FROM lobby_players WHERE lobby_id = $1', [
      lobbyId,
    ]);
    if (parseInt(remaining.rows[0].count ?? '0') === 0) {
      await client.query('DELETE FROM lobbies WHERE id = $1', [lobbyId]);
      console.log(`Lobby ${lobbyId} deleted because the last player ${leavingUserId} left.`);
      return true;
    }

    return false;
  }

  getDebugState() {
    const connectionDetails: unknown[] = [];
    for (const [socketId, socket] of this.io.sockets.sockets.entries()) {
      const userId = this.socketToUserMap.get(socketId);
      const subscribedRooms = Array.from(socket.rooms).filter((room) => room !== socket.id);
      connectionDetails.push({
        socketId,
        userId: userId || null,
        rooms: subscribedRooms,
      });
    }

    const lobbyPresence: Record<string, string[]> = {};
    for (const [lobbyId, users] of this.lobbyPresenceMap.entries()) {
      lobbyPresence[lobbyId] = Array.from(users);
    }

    return {
      connectedUsers: Array.from(this.userSocketMap.keys()),
      connectionDetails,
      lobbyPresence,
    };
  }

  getUserIdForSocket(socketId: string): string | undefined {
    return this.socketToUserMap.get(socketId);
  }

  getIo() {
    return this.io;
  }
}
