const path = require('path');

module.exports = {
    entry: './src/app.ts',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'bundle.js',
        library: 'SpaceGame',        // global namespace
        libraryTarget: 'window'   // attach to window.SpaceGame
    },
    devtool: 'source-map',
    resolve: {
        extensions: ['.ts', '.js']
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: 'ts-loader',
                exclude: /node_modules/
            }
        ]
    }
};
