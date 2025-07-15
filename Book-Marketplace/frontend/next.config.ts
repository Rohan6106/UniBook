/** @type {import('next').NextConfig} */
const nextConfig = {
  // Add this 'images' block
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.s3.amazonaws.com', // A more generic pattern
        port: '',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'pro-book-marketplace-final-ireland.s3.eu-west-1.amazonaws.com', // Your specific bucket hostname
        port: '',
        pathname: '/**', // Allow any path in the bucket
      },
    ],
  },
};

module.exports = nextConfig;