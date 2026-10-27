/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Unggah file Excel (maks 3 MB) dan foto (maks 2 MB) lewat Server Action
    serverActions: { bodySizeLimit: "4mb" },
  },
};

export default nextConfig;
