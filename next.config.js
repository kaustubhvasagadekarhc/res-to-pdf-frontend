/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable standalone output for Docker
  output: 'standalone',

  // Enable experimental features for better code splitting
  experimental: {
    // Optimize server components
    optimizePackageImports: ['lucide-react', 'framer-motion', '@radix-ui/react-dialog'],
  },

  // Turbopack configuration (Next.js 16 default)
  turbopack: {
    // Resolve alias for cleaner imports
    resolveAlias: {
      '@': __dirname,
    },
  },

  // Performance optimizations
  poweredByHeader: false,
  compress: true,
  generateEtags: false,
}

module.exports = nextConfig

