var browserSync = require('browser-sync');

browserSync({
  open: false,
  logLevel: "debug",
  logFileChanges: true,
  reloadDelay: 200,
  reloadDebounce: 500,
  files: [
    'demo/systemjs.config.js',
    'demo/src/*.ts', 'demo/*.html',
    'src/*.ts',
  ],
  watchOptions: {ignored: 'node_modules'},
  server: {baseDir: './',directory: true}
});
