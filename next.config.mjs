/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'aidisturbance.online',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'kwkvzdlonyhjpbxadzls.supabase.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
