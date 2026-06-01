import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Only use rewrites in development
  ...(process.env.NODE_ENV === 'development' && {
    async rewrites() {
      return [
        {
          source: '/api/:path*',
          destination: 'http://localhost:4000/api/:path*',
        },
      ];
    },
  }),
};

export default nextConfig;