/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    // Production build sırasında ESLint hatalarını ignore et
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Production build sırasında TypeScript hatalarını ignore et
    ignoreBuildErrors: true,
  },
};

export default nextConfig;

