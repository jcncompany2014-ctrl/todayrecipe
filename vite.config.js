import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'

export default defineConfig({
  plugins: [react()],
  server: { host: true },   // 같은 와이파이의 폰에서도 열리게 (localhost 전용 해제)
  resolve: {
    alias: { '@': path.resolve(process.cwd(), 'src') },   // BKLit 소스가 @/lib/utils 를 import
  },
})
