const path = require('node:path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const DnsPrefetchPlugin = require('../dist/webpack.cjs').default

module.exports = {
  mode: 'production',
  entry: './main.ts',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'index_boundle.js',
  },
  module: {
    rules: [
      {
        test: /\.(js|mjs|jsx|ts|tsx)$/,
        include: path.resolve(__dirname),
        exclude: /node_modules/i,
        loader: require.resolve('babel-loader'),
        // options: {
        //   presets: [],
        //   babelrc: false,
        //   configFile: false,
        //   cacheDirectory: true,
        //   cacheCompression: false,
        // },
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  plugins: [DnsPrefetchPlugin(), new HtmlWebpackPlugin({})],
}
