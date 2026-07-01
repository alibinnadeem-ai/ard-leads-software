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
      {
        // Brochure PDFs are served statically (CDN) — force download instead of opening inline.
        source: '/PDFs/:path*',
        headers: [
          { key: 'Content-Disposition', value: 'attachment' },
        ],
      },
    ]
  },
}

export default nextConfig
