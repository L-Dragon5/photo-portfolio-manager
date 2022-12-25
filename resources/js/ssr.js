import { createInertiaApp } from '@inertiajs/inertia-react';
import createServer from '@inertiajs/server';
import React from 'react';
import ReactDOMServer from 'react-dom/server';

/*
  Load server-side inertia app.
*/
createServer((page) =>
  createInertiaApp({
    page,
    render: ReactDOMServer.renderToString,
    resolve: (name) => require(`./Pages/${name}`),
    setup: ({ App, props }) => <App {...props} />,
  }),
);
