const path = require("path");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { InjectManifest } = require("workbox-webpack-plugin");

module.exports = {
  entry: {
    app: "src/client/index.tsx",
  },
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
        include: path.join(__dirname, "../src"),
        loader: "ts-loader",
      },
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"],
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
        { from: "pwa", to: "" },
        { from: "src/favicon.ico", to: "" },
      ],
    }),
    new InjectManifest({
      swSrc: path.resolve(__dirname, "../pwa/sw.js"),
    }),
  ],
};
