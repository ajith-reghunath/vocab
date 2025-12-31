/** @type {import('next').NextConfig} */
const nextConfig = {
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
