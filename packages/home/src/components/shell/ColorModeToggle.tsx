import { ClientOnly, IconButton, Skeleton } from '@chakra-ui/react';
import { useTheme } from 'next-themes';
import { LuMoon, LuSun } from 'react-icons/lu';

export function ColorModeToggle() {
  const { theme, setTheme } = useTheme();
  const toggleColorMode = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };
  return (
    // <Box>
    <ClientOnly fallback={<Skeleton w="10" h="10" rounded="md" />}>
      <IconButton aria-label="toggle color mode" onClick={toggleColorMode}>
        {theme === 'light' ? <LuMoon /> : <LuSun />}
      </IconButton>
    </ClientOnly>
    // </Box>
  );
}
