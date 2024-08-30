import { fileURLToPath, URL } from 'node:url';

import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { univerPlugin } from '@univerjs/vite-plugin';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: './',
  plugins: [univerPlugin(), vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build:{
    rollupOptions:{
      input: {
        main: './index.html',  // 确保 index.html 被作为入口文件处理
      },
      output: {
         format: 'es', 
         entryFileNames: `[name].js`,  // 保持 worker 文件名不变
      },
    }
  },
  worker: {
    format: 'es', // 强制 Worker 使用 ES module 格式
    rollupOptions: {
      output: {
        entryFileNames: `[name].js`,  // 保持 worker 文件名不变
      },
    },
  }
}));
