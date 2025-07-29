/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: 'standalone',
  images: {
    domains: ['localhost'],
  },
  i18n: {
    locales: ['vi', 'en'],
    defaultLocale: 'vi',
  },
}

module.exports = nextConfig 