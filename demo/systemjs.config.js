SystemJS.config({
  paths: {
    'npm:': '../node_modules/',
    //'npm:': 'https://unpkg.com/'
  },
  map: {
    ts: 'npm:plugin-typescript/lib',
    typescript: 'npm:typescript',

    '@angular/common': 'npm:@angular/common/bundles/common.umd.js',
    '@angular/core': 'npm:@angular/core/bundles/core.umd.js',
    '@angular/compiler': 'npm:@angular/compiler/bundles/compiler.umd.js',
    '@angular/platform-browser': 'npm:@angular/platform-browser/bundles/platform-browser.umd.js',
    '@angular/platform-browser-dynamic': 'npm:@angular/platform-browser-dynamic/bundles/platform-browser-dynamic.umd.js',

    rxjs: 'npm:rxjs'
  },
  packages: {
    ts: {main: 'plugin.js'},
    typescript: {
      main: 'lib/typescript.js',
      meta: {
        'lib/typescript.js': {
          'exports': 'ts'
        }
      }
    },
    src: {
      main: 'main.ts',
      defaultExtension: 'ts',
      meta: {'*.ts': {loader:'ts'}}
    },
    '../../src': {
      defaultExtension: 'ts',
      meta: {'*.ts': {loader:'ts'}}
    },
    rxjs: {
      defaultExtension: 'js'
    }
  },
  transpiler: 'ts',
  typescriptOptions: {
    "target": "es5",
    "module": "es2015",
    "moduleResolution": "node",
    "lib": ["es2015", "dom"],
    "noImplicitAny": true,
    "sourceMap": true,
    "declaration": true,
    "removeComments": false,
    "strictNullChecks": false,
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "stripInternal": true,
    "alwaysStrict": true,
    "noUnusedParameters": false,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "suppressImplicitAnyIndexErrors": true
  }
});
