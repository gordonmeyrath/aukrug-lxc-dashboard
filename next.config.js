/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone',
    basePath: '/dashboard',
    assetPrefix: '/dashboard',
    trailingSlash: true,

    experimental: {
        outputFileTracingRoot: process.cwd(),
    },

    env: {
        CUSTOM_KEY: process.env.CUSTOM_KEY,
        DOMAIN: process.env.DOMAIN,
        WP_BASE_URL: process.env.WP_BASE_URL,
        TENANT_NAME: process.env.TENANT_NAME,
        VILLAGE_NAME: process.env.VILLAGE_NAME,
    },

    // Disable image optimization for standalone build
    images: {
        unoptimized: true,
    },

    // Configure redirects
    async redirects() {
        return [
            {
                source: '/dashboard',
                destination: '/dashboard/',
                permanent: true,
            },
        ];
    },

    // Configure rewrites for API calls to WordPress
    async rewrites() {
        return {
            beforeFiles: [
                {
                    source: '/dashboard/api/wp/:path*',
                    destination: `${process.env.WP_BASE_URL || 'http://localhost'}/wp-json/aukrug/v1/:path*`,
                },
            ],
        };
    },
};

module.exports = nextConfig;