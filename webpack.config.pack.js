var CopyWebpackPlugin = require('copy-webpack-plugin');
module.exports = {
    output: {
        path: './typings'
    },
    resolve: {
        extensions: ["", ".ts", ".tsx", ".js"]
    }, plugins: [
        new CopyWebpackPlugin([
            {
                context: './node_modules',
                from: 'node_modules/colors/**/*'
            }
            // {
            //     context: 'src/',
            //     from: 'proto/**/*'
            // },
            // {context: '.', from: 'static/**/*'},
            // // {context: '.', from: 'db/**/*'},
            // {from: 'src/package.json'},
            // {from: 'src/reload.html'}
        ], {
            ignore: [
                // Doesn't copy any files with a txt extension
                '*.txt',

                // Doesn't copy any file, even if they start with a dot
                {glob: '**/*', dot: true}
            ]

            // By default, we only copy modified files during
            // a watch or webpack-dev-server build. Setting this
            // to `true` copies all files.
            // copyUnmodified: true
        })
    ]
};