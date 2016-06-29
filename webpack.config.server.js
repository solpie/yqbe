var nodeExternals = require('webpack-node-externals');
var CopyWebpackPlugin = require('copy-webpack-plugin');
var path = require('path');
module.exports = {
    entry: {
        "main": "./src/main.ts",//electron default entry index.js if no package.json
        "Server": "./src/Server.ts"
    },
    target: "electron",
    externals: [nodeExternals()],
    output: {
        path: './app',
        filename: "[name].js"
    },
    resolve: {
        extensions: ["", ".ts", ".tsx", ".js"]
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
            // all files with a `.ts` or `.tsx` extension will be handled by `ts-loader`
            {test: /\.tsx?$/, exclude: [/node_modules/, /YuanQiTV2-win32-x64/], loader: 'ts-loader'},
        ]
    },
    plugins: [
        new CopyWebpackPlugin([
            // {from: 'node_modules/ansi2html/**/*'},
            // {from: 'node_modules/body-parser/**/*'},
            // {from: 'node_modules/colors/**/*'},
            // {from: 'node_modules/ejs/**/*'},
            // {from: 'node_modules/express/**/*'},
            // {from: 'node_modules/morgan/**/*'},
            // {from: 'node_modules/msgpack-lite/**/*'},
            // {from: 'node_modules/nedb/**/*'},
            // {from: 'node_modules/socket.io/**/*'},
            // {from: 'node_modules/vue/**/*'},
            // {from: 'node_modules/vue-class-component/**/*'},
            // {from: 'node_modules/vue-resource/**/*'},
            // {from: 'node_modules/vue-resource/**/*'},
            // {from: 'node_modules/vue-router/**/*'},
            // {from: 'node_modules/xlsx/**/*'},
            // {from: 'node_modules/jszip/**/*'},
            {
                context: 'src/',
                from: 'view/**/*.ejs'
            },

            {context: '.', from: 'static/**/*'},
            // {context: '.', from: 'db/**/*'},
            {from: 'src/package.json'},
            {from: 'src/reload.html'}
        ])
    ]
};