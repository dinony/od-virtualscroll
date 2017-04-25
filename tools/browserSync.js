var browserSync = require('browser-sync');

browserSync({
  open: false,
  logLevel: "debug",
  logFileChanges: true,
  reloadDelay: 200,
  reloadDebounce: 500,
  files: [
    'demo/src/*.ts', 'demo/*.html',
    'src/*.ts', 
    'systemjs.config.js'
  ],
  watchOptions: {ignored: 'node_modules'},
  server: {baseDir: './',directory: true}
});