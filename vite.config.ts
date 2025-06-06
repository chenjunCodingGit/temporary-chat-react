import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  console.log(`当前环境: ${mode}`); // 输出当前环境模式
  const env = loadEnv(mode, process.cwd(), '');
  console.log(`当前环境: ${env.BASE_PATH}`); // 输出当前环境模式

  return {
    envPrefix: ['VITE_', 'BUILD_', 'BASE_'],
    define: {
      'process.env.NODE_ENV': JSON.stringify('production')
    },
    plugins: [react()],
    server: {
      port: 3000,
      proxy: {
        '/api': {
          target: 'http://localhost:4000',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
      },
    },
    build: {
      // 将 ChatDialog 组件打包成库
      lib: {
        entry: path.resolve(__dirname, 'src/main-lib.tsx'), // 创建一个新的入口文件专门用于库的构建
        name: 'ChatDialogLib', // UMD 构建模式下的全局变量名
        fileName: (format) => `chat-dialog-lib.${format}.js`, // 输出文件名格式
        formats: ['umd', 'es'] // 输出格式，UMD 兼容性好，ES 用于现代浏览器
      },
      rollupOptions: {
        // 确保外部化处理那些你不想打包进库的依赖
        external: ['react', 'react-dom'],
        output: {
          // 在 UMD 构建模式下为这些外部化的依赖提供一个全局变量
          globals: {
            react: 'React',
            'react-dom': 'ReactDOM'
          },
          //  确保 CSS 也被打包
          assetFileNames: (assetInfo) => {
            if (assetInfo.name === 'style.css') {
              return 'chat-dialog-lib.css';
            }
            return assetInfo.name || 'asset-[hash][extname]';
          },
        }
      },
      outDir: env.BASE_PATH // 指定库的输出目录，区别于应用的 `dist` 目录
    }
  }
})
