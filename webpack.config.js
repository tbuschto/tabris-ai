require('webpack');

module.exports = {
  entry: {
    index: './src/index.ts',
    worker: './src-worker/index.ts'
  },
  externals: ['tabris', 'tabris-decorators'],
  plugins: [],
  devtool: 'source-map',
  mode: 'development', // Preserve class names needed in tabris-decorators
  output: {
    libraryTarget: 'commonjs2',
    filename: "[name].js",
    path: __dirname + '/dist',
    devtoolModuleFilenameTemplate: '../[resource-path]',
    devtoolFallbackModuleFilenameTemplate: '[absolute-resource-path]'
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".jsx"],
    alias: {
      // Needed by TensorFlow:
      'buffer': 'buffer',
      // Needed by Jimp:
      'path': 'path',
      'process': 'process/browser',
      'stream': 'stream-browserify',
      'assert': 'assert',
      'zlib': 'browserify-zlib'
    },
    // All required for Jimp to load:
    fallback: {
      fs: false,
      querystring: false,
      url: false,
      https: false,
      http: false
    },
    plugins: []
  },
  module: {
    rules: [
      { test: /\.tsx?$/, loader: "ts-loader" }
    ]
  }
}
