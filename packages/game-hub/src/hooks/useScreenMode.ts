import { useState, useEffect } from 'react';

export type ScreenMode = 'mobile' | 'desktop';

export const useScreenMode = (): ScreenMode => {
  const [mode, setMode] = useState<ScreenMode>(window.innerWidth < 768 ? 'mobile' : 'desktop');

  useEffect(() => {
    const handleResize = () => {
      setMode(window.innerWidth < 768 ? 'mobile' : 'desktop');
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return mode;
};
