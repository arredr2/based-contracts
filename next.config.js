/** @type {import('next').NextConfig} */
const webpack = require('webpack');

const nextConfig = {
  // Explicitly load environment variables
  env: {
    NEXT_PUBLIC_CDP_API_KEY_NAME: process.env.NEXT_PUBLIC_CDP_API_KEY_NAME,
    NEXT_PUBLIC_CDP_API_KEY_PRIVATE_KEY: process.env.NEXT_PUBLIC_CDP_API_KEY_PRIVATE_KEY,
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        async_hooks: false,
        crypto: require.resolve('crypto-browserify'),
        stream: require.resolve('stream-browserify'),
        url: require.resolve('url/'),
        zlib: require.resolve('browserify-zlib'),
        http: require.resolve('stream-http'),
        https: require.resolve('https-browserify'),
        assert: require.resolve('assert/'),
        os: require.resolve('os-browserify/browser'),
        path: require.resolve('path-browserify'),
        process: require.resolve('process/browser'),
      };

      config.resolve.alias = {
        ...config.resolve.alias,
        process: "process/browser"
      };

      config.plugins = [
        ...config.plugins,
        new webpack.ProvidePlugin({
          process: 'process/browser',
        }),
      ];
    }

    return config;
  }
};

module.exports = nextConfig;
