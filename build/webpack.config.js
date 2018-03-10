var webpack = require('webpack')
var path = require('path')

module.exports = {
  entry: '../dist/xe-ajax1.js',
  output: {
    path: path.resolve(__dirname, '../dist'),
    filename: 'xe-ajax1.min.js'
  },
  plugins: [
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false
      }
    })
  ]
}
