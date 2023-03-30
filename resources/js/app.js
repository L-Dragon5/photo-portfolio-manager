import { InertiaApp } from '@inertiajs/inertia-react';
import { InertiaProgress } from '@inertiajs/progress';
import React from 'react';
import ReactDOM from 'react-dom';

/**
 * First we will load all of this project's JavaScript dependencies which
 * includes React and other helpers. It's a great starting point while
 * building robust, powerful web applications using React + Laravel.
 */

require('./bootstrap');

const root = document.getElementById('app');

if (typeof root !== 'undefined' && root !== null) {
  ReactDOM.render(
    <InertiaApp
      initialPage={JSON.parse(root.dataset.page)}
      resolveComponent={(name) => require(`./Pages/${name}`).default}
    />,
    root,
  );

  InertiaProgress.init();
}
