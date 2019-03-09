var path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
    mode: 'development',
    devtool: 'inline-source-map',
    entry: './src/app/main.ts',
    output: {
        filename: 'bundle.js',
        path: path.join(__dirname, 'dist'),
    },
    devServer: {
        contentBase: path.join(__dirname, 'dist'),
        hot: true,
    },
    module: {
        rules: [
            {
                test: /\.html$/,
                loader: 'raw-loader',
            },
            {
                test: /\.tsx?$/,
                loader: 'ts-loader',
                exclude: /node_modules/
            },
            {
                test: /\.js$/,
                loader: 'babel-loader',
                exclude: /node_modules/
            },
            { 
                test: /\.(jpe?g|gif|png|svg|woff|ttf|wav|mp3)$/, 
                loader: "file-loader" 
            }
        ]
    },
    resolve: {
        extensions: [ '.tsx', '.ts', '.js' ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            filename: 'index.html',
            template: './src/app/index.html'
        }),
        new CopyWebpackPlugin(['./static']),
        new webpack.NamedModulesPlugin(),
        new webpack.HotModuleReplacementPlugin()
    ]
};
