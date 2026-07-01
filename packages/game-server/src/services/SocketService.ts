import { Server, Socket } from 'socket.io';

export class SocketService {
  private io: Server;
  private userSocketMap = new Map<string, string>();
  private socketToUserMap = new Map<string, string>();
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

  isUserConnected(userId: string): boolean {
    return this.userSocketMap.has(userId);
  }

  private handleDisconnect(socket: Socket, reason: string) {
    console.log(`Socket disconnected: ${socket.id}. Reason: ${reason}`);

    const userId = this.socketToUserMap.get(socket.id);

    // Presence only — do not remove lobby_players rows (ADR-0009 soft disconnect).
    this.clearPresenceForSocket(socket.id);

    this.socketToUserMap.delete(socket.id);
    if (userId && this.userSocketMap.get(userId) === socket.id) {
      this.userSocketMap.delete(userId);
    }
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
