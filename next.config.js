/** @type {import('next').NextConfig} */
const webpack = require('webpack');

const nextConfig = {
  // Explicitly enable server-side rendering
  reactStrictMode: true,

  // Disable ESLint during builds
  eslint: {
    ignoreDuringBuilds: true,
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

      config.plugins = [
        ...config.plugins,
        new webpack.ProvidePlugin({
          process: 'process/browser',
        }),
      ];
    }

    return config;
  },

  // Add image domains if you're using next/image with external sources
  images: {
    domains: ['api.placeholder.com'],
  },
};

module.exports = nextConfig;
