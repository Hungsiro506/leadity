/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['localhost'],
  },
  i18n: {
    locales: ['vi', 'en'],
    defaultLocale: 'vi',
  },
}

module.exports = nextConfig 