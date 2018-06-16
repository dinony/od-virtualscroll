import {uglify} from 'rollup-plugin-uglify'
import filesize from 'rollup-plugin-filesize'

export default [
  {
    input: 'dist/es5/api.js',
    external: ['@angular/core', '@angular/common', 'rxjs', 'rxjs/operators'],
    output: {
      name: 'od.virtualscroll',
      format: 'umd',
      file: 'dist/bundle/od-virtualscroll.umd.js',
      sourcemap: true,
      globals: {
        '@angular/core': 'ng.core',
        '@angular/common': 'ng.common',
        'rxjs': 'rxjs',
        'rxjs/operators': 'rxjs.operators',
      }
    },
  },
  {
    input: 'dist/es5/api.js',
    external: ['@angular/core', '@angular/common', 'rxjs', 'rxjs/operators'],
    plugins: [
      uglify(),
      filesize()
    ],
    output: {
      name: 'od.virtualscroll',
      format: 'umd',
      file: 'dist/bundle/od-virtualscroll.min.umd.js',
      sourcemap: true,
      globals: {
        '@angular/core': 'ng.core',
        '@angular/common': 'ng.common',
        'rxjs': 'rxjs',
        'rxjs/operators': 'rxjs.operators',
      }
    }
  }]
