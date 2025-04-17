const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    entry: './src/index.tsx',
    mode: 'development',
    output: {
        path: path.resolve(__dirname, 'public/build'),
        filename: 'bundle.js',
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },
    module: {
        rules: [
            {
                test: /\.(ts|tsx)$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                      plugins: ['@babel/plugin-transform-modules-commonjs']
                    }
                  }
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader']
            },
            {
                test: /\.less$/,
                use: [
                    'style-loader',
                    'css-loader',
                    {
                        loader: 'less-loader',
                        options: {
                            lessOptions: {
                                javascriptEnabled: true
                            }
                        }
                    }
                ]
            }
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './public/legacy/index.html', // 保留原有 HTML 模板
            filename: 'index.html' // 生成新的 React 入口
        })
    ],
    devServer: {
        static: {
            directory: path.join(__dirname, 'public'),
        },
        port: 3000,
        proxy: [
            {
                context: ['/api'],
                target: 'http://localhost:4000',
                pathRewrite: { '^/api': '' },
            },
        ],
    },
};
