require('dotenv').config();
const { resolve } = require('path');
const nodeExternals = require('webpack-node-externals');
const webpack = require('webpack');
const TerserWebpackPlugin = require('terser-webpack-plugin');
const dotenv = require('dotenv');

const isProd = process.env.NODE_ENV === 'production';
const definitions = {};

if (isProd) {
    const parsedDotEnv = dotenv.config({ path: resolve(__dirname, '../.env') }).parsed;

    Object.keys(parsedDotEnv).forEach((key) => {
        definitions[`process.env.${key}`] = parsedDotEnv[key];
    });
}

const config = {
    mode: process.env.NODE_ENV,
    target: 'node',
    entry: './index.ts',
    output: {
        path: resolve(__dirname),
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
        new webpack.DefinePlugin(definitions),
    ]
};

config.optimization = {
    minimize: true,
    minimizer: [new TerserWebpackPlugin()],
};

module.exports = config;