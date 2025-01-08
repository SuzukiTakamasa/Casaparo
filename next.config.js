/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'export',
    images: {
        unoptimized: true,
        domains: ['r2-dev.incubus-appalachia.workers.dev', 'r2.incubus-appalachia.workers.dev'],
    }
}

module.exports = nextConfig
