const path = require('path');
const mix = require('laravel-mix');
const nodeExternals = require('webpack-node-externals');

/*
 |--------------------------------------------------------------------------
 | Mix Asset Management
 |--------------------------------------------------------------------------
 |
 | Mix provides a clean, fluent API for defining some Webpack build steps
 | for your Laravel application. By default, we are compiling the Sass
 | file for the application as well as bundling up all the JS files.
 |
 */

mix
  .options({ manifest: false })
  .js('resources/js/ssr.js', 'public/js')
  .react()
  .alias({ '@': path.resolve('resources/js') })
  .webpackConfig({
    target: 'node',
    externals: [nodeExternals()],
  });
