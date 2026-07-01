import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SocketService } from './SocketService.js';

function createMockIo() {
  const globalEmit = vi.fn();
  const roomEmit = vi.fn();
  const sockets = new Map<
    string,
    { id: string; rooms: Set<string>; disconnect: ReturnType<typeof vi.fn> }
  >();

  const io = {
    emit: globalEmit,
    to: vi.fn(() => ({ emit: roomEmit })),
    sockets: {
      sockets,
    },
    on: vi.fn(),
    engine: { clientsCount: 0 },
  };

  return { io: io as any, globalEmit, roomEmit, sockets };
}

describe('SocketService', () => {
  let mockIo: ReturnType<typeof createMockIo>;
  let socketService: SocketService;

  beforeEach(() => {
    mockIo = createMockIo();
    socketService = new SocketService(mockIo.io);
  });

  describe('lobby list notifications', () => {
    it('emits lobby_created globally', () => {
      socketService.emitLobbyCreated('lobby-1');
      expect(mockIo.globalEmit).toHaveBeenCalledWith('lobby_created', { lobbyId: 'lobby-1' });
    });

    it('emits lobby_updated globally', () => {
      socketService.emitLobbyUpdated('lobby-2');
      expect(mockIo.globalEmit).toHaveBeenCalledWith('lobby_updated', { lobbyId: 'lobby-2' });
    });

    it('emits lobby_deleted globally', () => {
      socketService.emitLobbyDeleted('lobby-3');
      expect(mockIo.globalEmit).toHaveBeenCalledWith('lobby_deleted', { lobbyId: 'lobby-3' });
    });
  });

  describe('presence tracking', () => {
    it('tracks connected users per lobby via join_lobby_room handler', () => {
      let connectionHandler: ((socket: any) => void) | undefined;
      mockIo.io.on.mockImplementation((_event: string, handler: (socket: any) => void) => {
        connectionHandler = handler;
      });

      socketService.initialize();

      const socketHandlers: Record<string, (data: any) => void> = {};
      const socket = {
        id: 'socket-1',
        handshake: { address: '127.0.0.1' },
        join: vi.fn((room: string) => {
          socket.rooms.add(room);
        }),
        leave: vi.fn((room: string) => {
          socket.rooms.delete(room);
        }),
        rooms: new Set<string>(['socket-1']),
        on: vi.fn((event: string, handler: (data: any) => void) => {
          socketHandlers[event] = handler;
        }),
      };

      connectionHandler!(socket);
      socketHandlers.set_user({ userId: 'user-1' });
      socketHandlers.join_lobby_room({ lobbyId: 'lobby-1', userId: 'user-1' });

      expect(socketService.getConnectedUserIdsInLobby('lobby-1')).toEqual(['user-1']);
      expect(mockIo.roomEmit).toHaveBeenCalledWith('player_presence', {
        userId: 'user-1',
        connected: true,
      });
    });

    it('emits presence offline on leave_lobby_room', () => {
      let connectionHandler: ((socket: any) => void) | undefined;
      mockIo.io.on.mockImplementation((_event: string, handler: (socket: any) => void) => {
        connectionHandler = handler;
      });

      socketService.initialize();

      const socketHandlers: Record<string, (data: any) => void> = {};
      const socket = {
        id: 'socket-1',
        handshake: { address: '127.0.0.1' },
        join: vi.fn(),
        leave: vi.fn(),
        rooms: new Set<string>(['socket-1', 'lobby-1']),
        on: vi.fn((event: string, handler: (data: any) => void) => {
          socketHandlers[event] = handler;
        }),
      };

      connectionHandler!(socket);
      socketHandlers.set_user({ userId: 'user-1' });
      socketHandlers.join_lobby_room({ lobbyId: 'lobby-1', userId: 'user-1' });
      mockIo.roomEmit.mockClear();

      socketHandlers.leave_lobby_room({ lobbyId: 'lobby-1', userId: 'user-1' });

      expect(socket.leave).toHaveBeenCalledWith('lobby-1');
      expect(socketService.getConnectedUserIdsInLobby('lobby-1')).toEqual([]);
      expect(mockIo.roomEmit).toHaveBeenCalledWith('player_presence', {
        userId: 'user-1',
        connected: false,
      });
    });
  });
});
