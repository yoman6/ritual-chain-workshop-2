/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  optimizeFonts: false, // fonts served from Google CDN at runtime

  webpack: (config) => {
    // Stub missing optional/native modules that are transitive deps of
    // @rainbow-me/rainbowkit → @wagmi/connectors → various wallet SDKs
    const stubs = [
      // @coinbase/cdp-sdk missing x402 peer deps
      '@x402/evm/upto/client',
      '@x402/evm/exact/client',
      '@x402/core/client',
      '@x402/svm/exact/client',
      '@x402/evm',
      // @metamask/sdk optional React Native dep
      '@react-native-async-storage/async-storage',
      // pino optional pretty-printer (only used in CLIs)
      'pino-pretty',
      // encoding optional dep in node-fetch
      'encoding',
    ]
    stubs.forEach((pkg) => {
      config.resolve.alias[pkg] = require.resolve('./lib/empty-stub.js')
    })
    return config
  },

  images: {
    remotePatterns: [],
  },
}

module.exports = nextConfig

