import { useCallback, useRef } from 'react';

interface SwipeGestureOptions {
  onSwipeLeft?: () => void;
  onSwipeUp?: () => void;
  threshold?: number;
}

export function useSwipeGesture({ onSwipeLeft, onSwipeUp, threshold = 60 }: SwipeGestureOptions) {
  const startRef = useRef<{ x: number; y: number } | null>(null);

  const onPointerDown = useCallback((event: React.PointerEvent<HTMLElement>) => {
    startRef.current = { x: event.clientX, y: event.clientY };
  }, []);

  const onPointerUp = useCallback(
    (event: React.PointerEvent<HTMLElement>) => {
      const start = startRef.current;
      startRef.current = null;
      if (!start) return;

      const deltaX = event.clientX - start.x;
      const deltaY = event.clientY - start.y;

      if (Math.abs(deltaX) < threshold && Math.abs(deltaY) < threshold) return;

      if (Math.abs(deltaX) >= Math.abs(deltaY) && deltaX < -threshold) {
        onSwipeLeft?.();
        return;
      }

      if (deltaY < -threshold) {
        onSwipeUp?.();
      }
    },
    [onSwipeLeft, onSwipeUp, threshold],
  );

  return { onPointerDown, onPointerUp };
}
