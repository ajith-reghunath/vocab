/** @type {import('next').NextConfig} */
const nextConfig = {
    eslint: {
        // Warning: This allows production builds to successfully complete even if
        // your project has ESLint errors.
        ignoreDuringBuilds: true,
    },
    images: {
        domains: [], // Add domains if needed for external images
    },
    experimental: {
        serverActions: {
            allowedOrigins: ["localhost:3000"]
        }
    }
};

export default nextConfig;
