/** @type {import('next').NextConfig} */
const nextConfig = {
    async redirects() {
        return [
            {
                source: '/',
                destination: '/login',
                permanent: true, // Set to true if this redirect is permanent (301), otherwise false (307)
            },
        ];
    },
};

export default nextConfig;
