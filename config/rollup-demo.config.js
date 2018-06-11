import nodeResolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs';
import {uglify} from 'rollup-plugin-uglify'
import {minify} from 'uglify-js-harmony';

export default {
  input: 'buildTmp/demo/src/main-aot.js',
  output: {
    file: 'build/build.gen.js', // output a single application bundle
    sourcemap: true,
    format: 'iife'
  },
  plugins: [
    nodeResolve({jsnext: true, module: true}),
    commonjs({
      include: 'node_modules/rxjs/**',
    }),
    uglify({}, minify)
  ]
}
