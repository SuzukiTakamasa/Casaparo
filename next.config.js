/** @type {import('next').NextConfig} */
const withPWA = require('next-pwa')({
    dest: 'public',
    register: true,
    skipWaiting: true,
    disable: process.env.NODE_ENV === 'development',
    // Never cache the start URL. Behind Cloudflare Access the `/` request can be an
    // auth redirect (opaqueredirect); next-pwa's default start-url handler would
    // rewrite that to a 200 and cache it, serving a broken `/` afterwards. Keeping
    // `/` network-only avoids that entirely.
    cacheStartUrl: false,
    dynamicStartUrl: false,
    runtimeCaching: [
        {
            urlPattern: /^\/$/,
            handler: 'NetworkOnly',
        },
    ],
})
const nextConfig = withPWA({
    output: 'export',
    images: {
        unoptimized: true,
        domains: [
            'r2-dev.incubus-appalachia.workers.dev',
            'r2.incubus-appalachia.workers.dev'
        ],
    }
})

module.exports = nextConfig
