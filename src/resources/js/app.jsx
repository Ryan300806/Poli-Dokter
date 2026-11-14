// Pintu masuk FE. Inertia v3 membaca halaman otomatis dari folder resources/js/Pages.
import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';

createInertiaApp({
  resolve: (name) =>
    resolvePageComponent(
      `./Pages/${name}.jsx`,
      import.meta.glob('./Pages/**/*.jsx'),
    ),
  progress: {
    color: '#499a13',
  },
});
