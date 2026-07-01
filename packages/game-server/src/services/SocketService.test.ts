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
    sockets: { sockets },
    on: vi.fn(),
    engine: { clientsCount: 0 },
  };

  return { io: io as any, globalEmit, roomEmit, sockets };
}

type SocketHandlers = Record<string, (data: unknown) => void>;

function connectSocket(
  mockIo: ReturnType<typeof createMockIo>,
  socketService: SocketService,
  socketId = 'socket-1',
) {
  let connectionHandler: ((socket: unknown) => void) | undefined;
  mockIo.io.on.mockImplementation((_event: string, handler: (socket: unknown) => void) => {
    connectionHandler = handler;
  });
  socketService.initialize();

  const handlers: SocketHandlers = {};
  const socket = {
    id: socketId,
    handshake: { address: '127.0.0.1' },
    join: vi.fn((room: string) => {
      socket.rooms.add(room);
    }),
    leave: vi.fn((room: string) => {
      socket.rooms.delete(room);
    }),
    rooms: new Set<string>([socketId]),
    on: vi.fn((event: string, handler: (data: unknown) => void) => {
      handlers[event] = handler;
    }),
    disconnect: vi.fn(),
  };

  connectionHandler!(socket);
  return { socket, handlers };
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
  });

  describe('presence tracking (ADR-0009)', () => {
    it('marks a player connected when they join a lobby room', () => {
      const { handlers } = connectSocket(mockIo, socketService);

      handlers.set_user({ userId: 'user-1' });
      handlers.join_lobby_room({ lobbyId: 'lobby-1', userId: 'user-1' });

      expect(socketService.getConnectedUserIdsInLobby('lobby-1')).toEqual(['user-1']);
      expect(mockIo.roomEmit).toHaveBeenCalledWith('player_presence', {
        userId: 'user-1',
        connected: true,
      });
    });

    it('emits presence offline on socket disconnect without DB leave', () => {
      const { handlers } = connectSocket(mockIo, socketService);

      handlers.set_user({ userId: 'user-1' });
      handlers.join_lobby_room({ lobbyId: 'lobby-1', userId: 'user-1' });
      mockIo.roomEmit.mockClear();

      handlers.disconnect('transport close');

      expect(socketService.getConnectedUserIdsInLobby('lobby-1')).toEqual([]);
      expect(mockIo.roomEmit).toHaveBeenCalledWith('player_presence', {
        userId: 'user-1',
        connected: false,
      });
    });

    it('replaces the previous socket when the same user identifies on a new socket', () => {
      const { handlers: handlers1, socket: socket1 } = connectSocket(
        mockIo,
        socketService,
        'socket-1',
      );
      socket1.disconnect = vi.fn();
      mockIo.sockets.set('socket-1', socket1 as never);
      handlers1.set_user({ userId: 'user-1' });

      const { handlers: handlers2 } = connectSocket(mockIo, socketService, 'socket-2');
      handlers2.set_user({ userId: 'user-1' });

      expect(socket1.disconnect).toHaveBeenCalledWith(true);
      expect(socketService.isUserConnected('user-1')).toBe(true);
    });
  });
});
