const webpack = require('webpack')
const path = require('path')




/*
 * SplitChunksPlugin is enabled by default and replaced
 * deprecated CommonsChunkPlugin. It automatically identifies modules which
 * should be splitted of chunk by heuristics using module duplication count and
 * module category (i. e. node_modules). And splits the chunks…
 *
 * It is safe to remove "splitChunks" from the generated configuration
 * and was added as an educational example.
 *
 * https://webpack.js.org/plugins/split-chunks-plugin/
 *
 */

/*
 * We've enabled UglifyJSPlugin for you! This minifies your app
 * in order to load faster and run less javascript.
 *
 * https://github.com/webpack-contrib/uglifyjs-webpack-plugin
 *
 */

const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
var nodeExternals = require('webpack-node-externals');


module.exports = {

  externals:[nodeExternals()],
  module: {
    rules: [{
      
      include: [path.resolve(__dirname, 'src')],
      loader: 'babel-loader',

      options: {
        sourceType: "script",
        presets: [['@babel/preset-env', {
          'modules': false,
          'targets': {
            node: "4.2.6"
          },
          'useBuiltIns': "entry"
        }]],
        plugins: [
          [
            "@babel/plugin-transform-runtime",
            {
              "corejs": false,
              "helpers": true,
              "regenerator": true,
              "useESModules": false
            }
          ]
        ],  
      },
      test: /\.js$/
    }]
  },

  entry: "./index.js",

  output: {
    filename: 'vapor_master.js',
    path: path.resolve(__dirname, 'dist')
  },

  mode: 'production',
  target: 'node',
  
  optimization: {
    splitChunks: {
      cacheGroups: {
        vendors: {
          priority: -10,
          test: /[\\/]node_modules[\\/]/
        }
      },

      chunks: 'async',
      minChunks: 1,
      minSize: 30000,
      name: true
    }
  }
}