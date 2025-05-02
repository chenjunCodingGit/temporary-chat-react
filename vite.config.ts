import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  css: {
    preprocessorOptions: {
      less: {
        // 这里可以添加 Less 的全局变量、全局 mixin 等配置
        modifyVars: {
          // 例如，修改主题颜色
          'primary-color': '#1DA57A',
        },
        javascriptEnabled: true,
      },
    },
  },
})
