/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['@prisma/client', 'prisma', 'nodemailer', 'twilio', 'jspdf'],
}

export default nextConfig
