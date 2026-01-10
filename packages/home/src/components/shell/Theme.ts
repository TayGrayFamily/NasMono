import { createSystem, defaultConfig, defineConfig } from '@chakra-ui/react';

const config = defineConfig({
  globalCss: {
    html: {
      // Sets teal as the default color for all components (Buttons, Checkboxes, etc.)
      colorPalette: 'teal',
    },
  },
  theme: {
    tokens: {
      colors: {},
    },
  },
});

export const system = createSystem(defaultConfig, config);
