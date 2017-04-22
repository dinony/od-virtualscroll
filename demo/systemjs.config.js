SystemJS.config({
  paths: {
    'npm:': '../node_modules/'
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
    tsconfig: '../../../tsconfig.json'
  }
});