/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      "localhost",
      "https://next-marketplace-production.up.railway.app",
    ],
  },
};

export default nextConfig;
