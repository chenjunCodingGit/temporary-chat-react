// 文件: vite.config.embed.ts (新建)

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // 指定输出目录
    outDir: 'dist-embed',
    // 配置库模式
    lib: {
      // 我们在步骤 1 中创建的入口文件
      entry: path.resolve(__dirname, 'src/embed.tsx'),
      // 暴露的全局变量名称
      name: 'AliChatEmbed',
      // 输出文件名的前缀
      fileName: (format) => `chat-embed.${format}.js`,
      // 我们需要一个 UMD 或 IIFE 格式的包，以便在浏览器中直接使用
      formats: ['umd'],
    },
    // 明确告诉 Vite 使用 terser 进行压缩
    minify: 'terser',
    terserOptions: {
      compress: {
        // 在生产环境中移除 console.log
        drop_console: true,
        drop_debugger: true,
      },
    },
    rollupOptions: {
      // 在 UMD 构建模式下，我们不需要将 React 等作为外部依赖，
      // 因为我们希望将所有东西都打包进一个文件。
      // 因此，这里的 external 应该是空的或不设置。
      external: [], 
      output: {
        // 在 UMD 构建模式下为这些全局变量提供命名
        globals: {
          // react: 'React',
          // 'react-dom': 'ReactDOM'
        },
      },
    },
  },
});

