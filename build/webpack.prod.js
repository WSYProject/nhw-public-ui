const path = require('path')
const { merge } = require('webpack-merge')
const commonConfig = require('./webpack.common')
const OptimizeCssAssetsWebpackPlugin = require('optimize-css-assets-webpack-plugin')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const prodConfig = {
  mode: 'production',
  devtool: 'cheap-module-source-map',
  entry: {
    'nhw-public-component-ui': './src/index.js'
  },
  output: {
    path: path.resolve(__dirname, '../dist'),
    publicPath: '/dist/',
    filename: 'publicComponent.js',
    library: 'publicComponent',
    libraryTarget: 'umd'
  },
  optimization: {
    minimizer: [
      new OptimizeCssAssetsWebpackPlugin({}) // css代码压缩
    ]
  },
  plugins: [
    new UglifyJsPlugin({
      parallel: true,
      sourceMap: true
    })
  ]
}

module.exports = merge(commonConfig, prodConfig)
