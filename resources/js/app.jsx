import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import { createInertiaApp } from '@inertiajs/react';
import { MantineProvider } from '@mantine/core';
import { ModalsProvider } from '@mantine/modals';
import { Notifications } from '@mantine/notifications';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';

createInertiaApp({
  progress: {
    color: '#29d',
  },
  resolve: (name) =>
    resolvePageComponent(
      `./Pages/${name}.jsx`,
      import.meta.glob('./Pages/**/*.jsx'),
    ),
  setup({ el, App, props }) {
    createRoot(el).render(
      <MantineProvider defaultColorScheme="auto">
        <ModalsProvider>
          <Notifications />
          <App {...props} />
        </ModalsProvider>
      </MantineProvider>,
    );
  },
});
