import resolve from 'rollup-plugin-node-resolve';
import babel from 'rollup-plugin-babel';
import uglify from 'rollup-plugin-uglify';

const packageInfo = require( './package.json' );

export default {
    entry: 'src/Router/Router.js',
    format: 'umd',
    moduleName: 'router',
    sourceMap: true,
    plugins: [
        resolve(),
        babel({
            exclude: 'node_modules/**'
        }),
        uglify()
    ],
    targets: [
        { dest: packageInfo.browser, format: 'iife' },
        { dest: packageInfo.main, format: 'umd' }
    ]
};
