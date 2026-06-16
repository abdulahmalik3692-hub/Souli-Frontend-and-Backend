import path from "path"
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    modulePreload: false,
    rollupOptions: {
      output: {
        manualChunks: {
          // 3D rendering engine (~150KB gzip)
          'vendor-three': ['three'],
          // Animation libraries
          'vendor-animation': ['framer-motion', 'motion', 'gsap', 'gsap-trial'],
          // Charting library
          'vendor-charts': ['recharts'],
          // PDF generation & screenshot
          'vendor-pdf': ['jspdf', 'html2canvas'],
          // React core
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          // UI primitives
          'vendor-ui': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-slot',
            '@radix-ui/react-tooltip',
            'lucide-react',
            'swiper',
          ],
        },
      },
    },
  },
})