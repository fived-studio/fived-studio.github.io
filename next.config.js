/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_PULSE_API: process.env.NEXT_PUBLIC_PULSE_API ?? "https://api.fived.studio",
  },
};

module.exports = nextConfig;
