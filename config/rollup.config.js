export default {
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
  }
}
