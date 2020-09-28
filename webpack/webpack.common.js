const path = require("path");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { InjectManifest } = require("workbox-webpack-plugin");

module.exports = {
  entry: ["./src/client/scripts/game.ts", "./webpack/credits.js"],
  output: {
    path: path.resolve(__dirname, "../dist"),
    filename: "[name].bundle.js",
    chunkFilename: "[name].chunk.js",
  },
  resolve: {
    alias: {
      src: path.resolve(__dirname, "../src"),
    },
    extensions: [".ts", ".tsx", ".js"],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        // test: function (modulePath) {
        //   return (
        //     (modulePath.endsWith(".ts") || modulePath.endsWith(".tsx")) &&
        //     !modulePath.endsWith("test.ts")
        //   );
        // },
        include: path.join(__dirname, "../src"),
        loader: "ts-loader",
      },
    ],
  },
  optimization: {
    splitChunks: {
      cacheGroups: {
        commons: {
          test: /[\\/]node_modules[\\/]/,
          name: "vendors",
          chunks: "all",
          filename: "[name].bundle.js",
        },
      },
    },
  },
  plugins: [
    new HtmlWebpackPlugin({
      gameName: "Letter Jam",
      template: "src/index.html",
    }),
    new CopyWebpackPlugin({
      patterns: [
        { from: "src/client/assets", to: "assets" },
        { from: "pwa", to: "" },
        { from: "src/favicon.ico", to: "" },
      ],
    }),
    new InjectManifest({
      swSrc: path.resolve(__dirname, "../pwa/sw.js"),
    }),
  ],
};
