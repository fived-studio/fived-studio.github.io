/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  reactStrictMode: true,
  env: {
    // Set NEXT_PUBLIC_PULSE_API at build time. CI gets it from the
    // PULSE_API_URL repo variable; for local dev `bun run dev` defaults
    // to a localhost backend.
    NEXT_PUBLIC_PULSE_API: process.env.NEXT_PUBLIC_PULSE_API ?? "http://localhost:8787",
  },
};

module.exports = nextConfig;
