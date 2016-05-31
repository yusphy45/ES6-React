/**
 * Created by hanjinchi on 15/11/26.
 */
const path = require('path');
const webpack = require('webpack');
const HtmlwebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const CommonsChunkPlugin = require("webpack/lib/optimize/CommonsChunkPlugin");
//定义了一些文件夹的路径
const ROOT_PATH = path.resolve(__dirname);
const JS_PATH = path.resolve(ROOT_PATH, 'src/js');
const BUILD_PATH = path.resolve(ROOT_PATH, 'dist');
const TEM_PATH = path.resolve(ROOT_PATH, 'src/template');
const autoprefixer = require('autoprefixer');
const px2rem = require('postcss-px2rem');

//判断是否deploy
var isProduction = process.env.NODE_ENV === 'production';

var plugins = [
  new HtmlwebpackPlugin({
    title: 'web-audio',
    template: path.resolve(TEM_PATH, 'index.html'),
    filename: 'index.html',
    inject: false
  })
];

module.exports = {
  //入口文件
  entry: {
    app: JS_PATH
  },
  output: {
    path: BUILD_PATH,
    publicPath: '/dist/',
    filename: isProduction ? '[name].[chunkhash:6].js' : '[name].js'
  },

  resolve: {
    root: [process.cwd() + '/src', process.cwd() + '/node_modules'],
    alias: {},
    extensions: ['', '.js', '.css', '.png', '.jpg']
  },

  module: {
    loaders: [{
      test: /\.js?$/,
      loaders: ['babel?presets[]=es2015'],
      include: JS_PATH
    }, {
      test: /\.s?css$/,
      loader: ExtractTextPlugin.extract('style', 'css', 'sass', 'postcss')
    }]
  },

  postcss: function () {
    return [px2rem({remUnit: 75}), autoprefixer];
  },

  devServer: {
    historyApiFallback: true,
    hot: true,
    inline: true,
    progress: true
  },

  devtools: 'eval-source-map',

  plugins: plugins
};


if (isProduction) {
  plugins.push.apply(plugins, [
    new ExtractTextPlugin('[name].[contenthash:6].css'),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: '"production"'
      }
    }),
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false
      },
      sourceMap: false
    }),
    new webpack.optimize.OccurenceOrderPlugin(),
    new CommonsChunkPlugin("vendor", "[name].[hash:6].js")
  ]);
} else {
  plugins.push.apply(plugins, [
    new ExtractTextPlugin('[name].css'),
    new CommonsChunkPlugin("vendor", "[name].js")
  ]);
  module.exports.devtool = '#source-map'
}
