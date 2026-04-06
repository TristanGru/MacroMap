import type { NextConfig } from "next";
import { createRequire } from "module";
import path from "path";

const require = createRequire(import.meta.url);
const CopyWebpackPlugin = require("copy-webpack-plugin");

const nextConfig: NextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.plugins.push(
        new CopyWebpackPlugin({
          patterns: [
            {
              from: "node_modules/cesium/Build/Cesium/Workers",
              to: "../public/cesium/Workers",
            },
            {
              from: "node_modules/cesium/Build/Cesium/ThirdParty",
              to: "../public/cesium/ThirdParty",
            },
            {
              from: "node_modules/cesium/Build/Cesium/Assets",
              to: "../public/cesium/Assets",
            },
            {
              from: "node_modules/cesium/Build/Cesium/Widgets",
              to: "../public/cesium/Widgets",
            },
          ],
        })
      );

      // Define CESIUM_BASE_URL for the Cesium library
      config.plugins.push(
        new (require("webpack").DefinePlugin)({
          CESIUM_BASE_URL: JSON.stringify("/cesium"),
        })
      );
    }

    return config;
  },
};

export default nextConfig;
