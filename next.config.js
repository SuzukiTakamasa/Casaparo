/** @type {import('next').NextConfig} */
const withPWA = require('next-pwa')({
    dest: 'public',
    register: true,
    skipWaiting: true,
    disable: process.env.NODE_ENV === 'development',
})
const nextConfig = withPWA({
    output: 'standalone',
    images: {
        unoptimized: true,
        domains: ['r2-dev.incubus-appalachia.workers.dev', 'r2.incubus-appalachia.workers.dev'],
    }
})

module.exports = nextConfig
