/** @type {import('next').NextConfig} */
const nextConfig = {
    // 在這裡添加 'images' 屬性來禁用優化
    images: {
      unoptimized: true,
    },
  };
  
  export default nextConfig;