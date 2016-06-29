"use strict"
var webpack = require('webpack');
var CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
    entry: {
        "static/admin/index": "./src/view/admin/index.ts",
        "static/mobile/index": "./src/view/mobile/index.ts",
        "static/panel/index": "./src/view/panel/index.ts"
    },
    output: {
        path: './app',
        filename: "[name].js"
    },
    devtool: 'source-map',
    module: {
        preLoaders: [
            {
                test: /\.js$/,
                loader: 'source-map-loader'
            }
        ],
        loaders: [
            {test: /\.tsx?$/, loader: "ts-loader"},
            {test: /\.html$/, loader: "html-loader?minimize=false"}
        ]
    },
    resolve: {
        extensions: ["", ".ts", ".tsx", ".html", ".js"]
    },
    plugins: [
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: '"production"'
            }
        }),
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: false
            }
        })
    ]
};
