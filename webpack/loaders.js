const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const JSLoader = {
    test: /\.js$/,
    exclude: /node_modules/,
    use: {
        loader: 'babel-loader',
        options: {
            presets: ['@babel/preset-env']
        }
    }
};

const CSSLoader = {
    test: /\.css$/,
    exclude: /node_modules/,
    use: [{
            loader: MiniCssExtractPlugin.loader,
            options: {
                publicPath: __dirname + '/../../public/css/'
            }
        },
        {
            loader: 'css-loader',
            options: {
                url: false,
                importLoaders: 1
            },
        },
        {
            loader: 'postcss-loader',
            options: {
                config: {
                    path: __dirname + '/postcss.config.js'
                }
            },
        },
    ],
};

module.exports = {
    JSLoader: JSLoader,
    CSSLoader: CSSLoader,
};