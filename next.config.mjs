/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['@prisma/client', 'prisma', 'nodemailer', 'jspdf'],
  async headers() {
    return [
      {
        source: '/embed',
        headers: [
          { key: 'Content-Security-Policy', value: 'frame-ancestors *' },
        ],
      },
    ]
  },
}

export default nextConfig
