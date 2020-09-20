学习笔记
#### 这周记录webpack的基本配置
```javascript
const path = require('path');
module.exports = {
    mode: "production", // "production" | "development" | "none"  // 告诉webpack是生产环境还是开发环境.
    entry: "./app/entry", // string | object | array  // 默认 ./src
    // 入口起点，可以指定多个入口起点
    output: {
        // 输出，只可指定一个输出配置
        path: path.resolve(__dirname, "dist"), // string
        //  所有输出文件所在的目录
        // 必须是绝对路径(use the Node.js path module)
        filename: "bundle.js", // string    // 输出文件的名称
        publicPath: "/assets/", // string    // 相对于HTML页面解析的输出目录的url
        library: "MyLibrary", // string,
        //导出库的名称
        libraryTarget: "umd", // universal module definition    // the type of the exported library
    },
    module: { //如何处理项目中不同类型的模块
        rules: [ //用于规定在不同模块被创建时如何处理模块的规则数组
            {
                test: /\.jsx?$/, //匹配特定文件的正则表达式或正则表达式数组
                include: [ //规则适用的范围
                    path.resolve(__dirname, "app")
                ],
                exclude: [ //规则排除的范围
                    path.resolve(__dirname, "app/demo-files")
                ],
                issuer: { test, include, exclude },
                enforce: "pre",
                enforce: "post",
                loader: "babel-loader", //加载器
                options: { //转义
                    presets: ["es2015"]
                },
            },
            {
                test: /\.html$/,
                use: [
                    "htmllint-loader",
                    {
                        loader: "html-loader",
                        options: {
                            /* ... */
                        }
                    }
                ]
            },
        ],
    },
    resolve: {
        // 解决模块请求的选项
        modules: [
            "node_modules",
            path.resolve(__dirname, "app")
        ],
        extensions: [".js", ".json", ".jsx", ".css"], // 用到的扩展
        alias: { //模块名称别名列表
            "module": path.resolve(__dirname, "app/third/module.js"),
        },
    },
    performance: {
        hints: "warning", // enum    maxAssetSize: 200000, // int (in bytes),
        maxEntrypointSize: 400000, // int (in bytes)
        assetFilter: function(assetFilename) {
            return assetFilename.endsWith('.css') || assetFilename.endsWith('.js');
        }
    },
    devtool: "source-map", // 代码映射，增强调试，以构建速度为代价
    context: __dirname, // string (绝对路径) //webpack的主目录
    target: "web",
    externals: ["react", /^@angular\//],  //不要跟踪/捆绑这些模块，而是在运行时从环境中请求它们
    serve: {
        port: 1337,
        content: './dist',
        // ...
    },
    stats: "errors-only",  // 让你精确地控制被显示的包信息
    devServer: {
        proxy: { // 代理url
            '/api': 'http://localhost:3000'
        },
        contentBase: path.join(__dirname, 'public'), // boolean | string | array, static file location
        compress: true, //支持gzip压缩
        historyApiFallback: true, // html在404，对象为多个路径
        hot: true, // 热模块替换。取决于HotModuleReplacementPlugin
        https: false,
        noInfo: true,
        // ...
    },
    plugins: [ //webpack插件列表
        // ...
    ]
}
```