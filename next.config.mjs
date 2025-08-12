/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable if you need to use external images
  images: {
    domains: [],
  },
  // Ensure Prisma works correctly
  serverExternalPackages: ['@prisma/client', 'prisma'], // 👈 root level
  };


export default nextConfig;
