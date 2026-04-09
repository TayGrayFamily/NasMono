import { createContext, useContext, useMemo, ReactNode } from 'react';
import io, { Socket } from 'socket.io-client';

const SocketContext = createContext<Socket | null>(null);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children, url }: { children: ReactNode; url: string }) => {
  const socket = useMemo(() => io(url), [url]);

  return <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>;
};
