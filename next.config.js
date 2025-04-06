/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // Exclude specific node module binaries from being processed by webpack
    config.externals = [
      ...(config.externals || []),
      { 
        "sharp": "commonjs sharp",
        "onnxruntime-node": "commonjs onnxruntime-node"
      }
    ];
    
    return config;
  },
};

module.exports = nextConfig;
