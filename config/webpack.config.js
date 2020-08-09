const { resolve, join } = require("path");
console.log(process.env.NODE_ENV, join(__dirname, "../public"), resolve(__dirname, "../src/main.js"))
module.exports = {
  entry: {
    main: resolve(__dirname, "../src/main.js")
  },
  mode: "development",
  optimization: {
    minimize: false,
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env"],
            plugins: [
              [
                "@babel/plugin-transform-react-jsx",
                { pragma: "ToyReact.createElement" },
              ],
            ],
          },
        },
      },
      {
        test: /\.css$/,
        use: [
          { loader: 'style-loader' },
          {
            loader: 'css-loader',
            options: {
              // modules: true
            }
          }
        ]
      },
    ],
  },
  devServer: {
    contentBase: join(__dirname, '../public'),
    publicPath: '/',
    host: 'localhost', // can be overwritten by process.env.HOST
    port: 8080, // can be overwritten by process.env.PORT, if port is in use, a free one will be determined
    overlay: true, // 浏览器页面上显示错误
    // open: true // 开启浏览器
    // stats: "errors-only", //stats: "errors-only"表示只打印错误：
    // hot: true // 开启热更新
    quiet: true // FriendlyErrorsWebpackPlugin
  },
};
