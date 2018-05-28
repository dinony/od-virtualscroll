export default {
  input: 'dist/es5/api.js',
  output: {
    name: 'od.virtualscroll',
    format: 'umd',
    file: 'dist/bundle/od-virtualscroll.umd.js',
    sourcemap: true,
    globals: {
      '@angular/core': 'ng.core',
      '@angular/common': 'ng.common',
      // 'rxjs/Observable': 'Rx',
      // 'rxjs/ReplaySubject': 'Rx',
      // 'rxjs/add/operator/map': 'Rx.Observable.prototype',
      // 'rxjs/add/operator/mergeMap': 'Rx.Observable.prototype',
      // 'rxjs/add/observable/fromEvent': 'Rx.Observable',
      // 'rxjs/add/observable/of': 'Rx.Observable'
    }
  }
}
