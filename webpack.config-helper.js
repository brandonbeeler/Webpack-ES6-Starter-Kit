'use strict';

const Path = require('path')
const Webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const ExtractSASS = new ExtractTextPlugin('styles/bundle.css');
const LiveReloadPlugin = require('webpack-livereload-plugin');

/*
 * options can be configured in webpack-{env}.config.js
 *  Option values are:
 *    - isProduction: Boolean
 *    - devtool: String
 *    - port: Number
 */
module.exports = (options) => {

  /*
   * Base webpack configuration
   * Other options will be added depending if we are running in production or not
   */
  let webpackConfig = {
    devtool: options.devtool,
    entry: [
      `webpack-dev-server/client?http://localhost:${options.port}`,
      'webpack/hot/dev-server',
      './src/scripts/index'
    ],
    output: {
      path: Path.join(__dirname, 'dist'),
      filename: 'bundle.js'
    },
    plugins: [
      new Webpack.DefinePlugin({
        'process.env': {
          NODE_ENV: JSON.stringify(options.isProduction ? 'production' : 'development')
        }
      }),
      new HtmlWebpackPlugin({
        template: './src/index.html'
      })
    ],
    module: {
      loaders: [{
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        loader: 'babel',
        query: {
          presets: ['es2015']
        }
      }]
    }
  };

  if (options.isProduction) {      // PRODUCTION WEBPACK CONFIGURATION

    // set entry point
    webpackConfig.entry = ['./src/scripts/index'];

    // add plugins
    webpackConfig.plugins.push(
      new Webpack.optimize.OccurenceOrderPlugin(),
      new Webpack.optimize.UglifyJsPlugin({
        compressor: {
          warnings: false
        }
      }),
      ExtractSASS
    );

    // add loaders
    webpackConfig.module.loaders.push({
      test: /\.scss$/i,
      loader: ExtractSASS.extract(['css', 'sass'])
    });

  } else {                         // DEV WEBPACK CONFIGURATION

    // add webpack plugins
    webpackConfig.plugins.push(
      new Webpack.HotModuleReplacementPlugin(),
      new LiveReloadPlugin({
        appendScriptTag: true
      })
    );

    // add loaders
    webpackConfig.module.loaders.push({
        test: /\.scss$/i,
        loaders: ['style', 'css', 'sass']
      }, {
        test: /\.js$/,
        loader: 'eslint',
        exclude: /node_modules/
      }
    );

    // configure webpack dev server
    webpackConfig.devServer = {
      contentBase: './dist',
      hot: true,
      port: options.port,
      inline: true,
      progress: true
    };

  }

  return webpackConfig;

}