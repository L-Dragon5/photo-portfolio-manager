import { ChakraProvider } from '@chakra-ui/react';
import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';

createInertiaApp({
  progress: {
    color: '#29d',
  },
  resolve: (name) =>
    resolvePageComponent(
      `./Pages/${name}.jsx`,
      import.meta.glob('./Pages/**/*.jsx', { eager: true }),
    ),
  setup({ el, App, props }) {
    createRoot(el).render(
      <ChakraProvider>
        <App {...props} />
      </ChakraProvider>,
    );
  },
});
