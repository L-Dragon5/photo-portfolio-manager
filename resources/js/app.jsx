import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import { createInertiaApp } from '@inertiajs/react';
import { createTheme, MantineProvider } from '@mantine/core';
import { ModalsProvider } from '@mantine/modals';
import { Notifications } from '@mantine/notifications';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';

const theme = createTheme({
  components: {
    ActionIcon: {
      defaultProps: {
        size: 'lg',
      },
    },
  },
});

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
      <MantineProvider theme={theme} defaultColorScheme="auto">
        <ModalsProvider>
          <Notifications />
          <App {...props} />
        </ModalsProvider>
      </MantineProvider>,
    );
  },
});
