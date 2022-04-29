require('dotenv').config();
const { resolve } = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const TerserWebpackPlugin = require('terser-webpack-plugin');
const dotenv = require('dotenv');

const isProd = process.env.NODE_ENV === 'production';
const config = {
    mode: process.env.NODE_ENV,
    entry: {
        index: './src/index.tsx',
    },
    output: {
        path: resolve(__dirname, 'server/build/client'),
        filename: 'index.js',
    },
    resolve: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'babel-loader',
                exclude: /node_modules/,
            },
            {
                test: /\.css$/,
                use: [
                  "style-loader",
                  {
                    loader: "css-loader",
                    options: {
                      importLoaders: 1,
                      modules: true,
                    },
                  },
                ],
                include: /\.module\.css$/,
            },
            {
                test: /\.css$/,
                use: ["style-loader", "css-loader"],
                exclude: /\.module\.css$/,
            },
        ],
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './src/index.html',
            filename: 'index.html',
            inject: 'body',
        }),
        new webpack.DefinePlugin({
            'process.env': JSON.stringify(dotenv.config().parsed),
        }),
    ],
};

if (isProd) {
    config.optimization = {
        minimize: true,
        minimizer: [new TerserWebpackPlugin()],
    };
} else {
    config.devServer = {
        port: process.env.CLIENT_PORT,
        open: true,
        hot: true,
        compress: true,
    }
}

module.exports = config;