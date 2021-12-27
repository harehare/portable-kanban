//@ts-check

'use strict';

const path = require('path');
const webpack = require('webpack');

const extensionConfig = {
  target: 'node',
  mode: 'none',
  entry: {
    extension: './src/extension.ts',
    kanban: './src/kanban/index.tsx',
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
    libraryTarget: 'commonjs2',
  },
  externals: {
    vscode: 'commonjs vscode',
  },
  resolve: {
    extensions: ['.ts', '.js', '.tsx', '.css'],
  },
  plugins:
    process.env.NODE_ENV === 'develop'
      ? [new webpack.EnvironmentPlugin(['NODE_ENV'])]
      : [],
  module: {
    rules: [
      {
        test: /\.svg$/,
        use: ['@svgr/webpack'],
      },
      {
        test: /\.css/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: { url: false },
          },
        ],
      },
      {
        test: /\.(ts|tsx)$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'ts-loader',
          },
        ],
      },
    ],
  },
  devtool: 'source-map',
};
module.exports = [extensionConfig];
