/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { dev }) => {
    if (dev) {
      // Disable webpack cache in development to prevent corruption
      // and eliminate white screen issues caused by stale chunks
      config.cache = false;
    }
    return config;
  }
}

module.exports = nextConfig;
