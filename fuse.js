'use strict'

/**
 * FUSEBOX
 *
 * Client & Server compiler / bundler / watcher
 */

const colors = require('colors/safe')
const fsbx = require('fuse-box')
const nodemon = require('nodemon')
const babel = require('babel-core')
const uglify = require('uglify-es')
const fs = require('fs-extra')

// ======================================================
// Parse cmd arguments
// ======================================================

const args = require('yargs')
  .option('d', {
    alias: 'dev',
    describe: 'Start in Developer mode',
    type: 'boolean'
  })
  .help('h')
  .alias('h', 'help')
  .argv

const dev = args.d

if (dev) {
  console.info(colors.bgWhite.black(' Starting Fuse in DEVELOPER mode... '))
} else {
  console.info(colors.bgWhite.black(' Starting Fuse in BUILD mode... '))
}

// ======================================================
// BUILD VARS
// ======================================================

const ALIASES = {
  'velocity': (dev) ? 'velocity-animate/velocity.js' : 'velocity-animate/velocity.min.js',
  'vue': (dev) ? 'vue/dist/vue.js' : 'vue/dist/vue.min.js',
  'vue-resource': (dev) ? 'vue-resource/dist/vue-resource.js' : 'vue-resource/dist/vue-resource.es2015.js'
}

// ======================================================
// Fuse Tasks
// ======================================================

let fuse = fsbx.FuseBox.init({
  homeDir: './client',
  output: './assets/js/$name.js',
  alias: ALIASES,
  target: 'browser',
  plugins: [
    fsbx.EnvPlugin({ NODE_ENV: (dev) ? 'development' : 'production' }),
    fsbx.VuePlugin(),
    ['.scss', fsbx.SassPlugin({ outputStyle: (dev) ? 'nested' : 'compressed' }), fsbx.CSSPlugin()],
    fsbx.BabelPlugin({
      comments: false,
      presets: ['es2015']
    }),
    fsbx.JSONPlugin()
  ],
  debug: false,
  log: true
})

if (dev) {
  fuse.dev({
    httpServer: false
  })
}

const bundleVendor = fuse.bundle('vendor').instructions('~ index.js')
const bundleApp = fuse.bundle('app').instructions('!> [index.js]')

if (dev) {
  bundleVendor.hmr()
  bundleApp.hmr().watch()
}

fuse.run().then(() => {
  console.info(colors.green.bold('\nAssets compilation + bundling completed.'))

  if (dev) {
    nodemon({
      exec: 'node index.js',
      ignore: ['assets/', 'client/'],
      ext: 'js json',
      watch: ['index.js', 'controllers', 'middlewares'],
      env: { 'NODE_ENV': 'development' }
    })
  } else {
    console.info(colors.yellow.bold('\nTranspiling vendor bundle...'))
    let appCode = babel.transform(fs.readFileSync('./assets/js/app.js', 'utf8'), {
      babelrc: false,
      compact: false,
      filename: 'app.js',
      plugins: ['transform-object-assign']
    }).code
    let vendorCode = babel.transform(fs.readFileSync('./assets/js/vendor.js', 'utf8'), {
      babelrc: false,
      comments: false,
      compact: false,
      filename: 'vendor.js',
      plugins: [
        'transform-es2015-arrow-functions',
        'transform-es2015-block-scoped-functions',
        'transform-es2015-block-scoping',
        'transform-es2015-classes',
        'transform-es2015-computed-properties',
        'transform-es2015-destructuring',
        'transform-es2015-duplicate-keys',
        'transform-es2015-for-of',
        'transform-es2015-function-name',
        'transform-es2015-literals',
        'transform-es2015-object-super',
        'transform-es2015-parameters',
        'transform-es2015-shorthand-properties',
        'transform-es2015-spread',
        'transform-es2015-sticky-regex',
        'transform-es2015-template-literals',
        'transform-es2015-typeof-symbol',
        'transform-es2015-unicode-regex'
      ]
    }).code
    console.info(colors.yellow.bold('Minifing bundles...'))
    fs.writeFileSync('./assets/js/vendor.js', uglify.minify(vendorCode).code, 'utf8')
    fs.writeFileSync('./assets/js/app.js', uglify.minify(appCode).code, 'utf8')
    console.info(colors.green.bold('\nBUILD SUCCEEDED.'))
    return true
  }
}).catch(err => {
  console.error(colors.red(' X Bundle compilation failed! ' + err.message))
  process.exit(1)
})
