require('dotenv').config();
const { resolve } = require('path');
const nodeExternals = require('webpack-node-externals');
const webpack = require('webpack');
const TerserWebpackPlugin = require('terser-webpack-plugin');
const dotenv = require('dotenv');

const dotEnv = dotenv.config({ path: resolve(__dirname, '../.env') }).parsed;
const processEnv = {};

Object.keys(dotEnv).forEach((key) => {
    processEnv[`process.env.${key}`] = dotEnv[key];
});

const config = {
    mode: process.env.NODE_ENV,
    target: 'node',
    entry: './index.ts',
    output: {
        path: resolve(__dirname, './build'),
        filename: 'server.js',
    },
    resolve: {
        extensions: ['.ts'],
    },
    externals: [nodeExternals()],
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: 'ts-loader'
            },
        ],
    },
    plugins: [
        new webpack.DefinePlugin(processEnv),
    ]
};

config.optimization = {
    minimize: true,
    minimizer: [new TerserWebpackPlugin()],
};

module.exports = config;