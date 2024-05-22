const path = require('node:path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
// const DnsPrefetchPlugin = require('../dist/webpack.cjs').default
const DnsPrefetchPlugin = require('unplugin-prefetch-dns/webpack').default

module.exports = {
  mode: 'development',
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
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  plugins: [
    new HtmlWebpackPlugin({}),
    DnsPrefetchPlugin(),
  ],
}
