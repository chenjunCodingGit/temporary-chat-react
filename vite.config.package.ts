import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';

// Vite 配置文件，用于将组件打包成一个NPM库

export default defineConfig({
  plugins: [
    react(),
    // dts 插件用于自动生成 TypeScript 类型定义文件 (.d.ts)
    dts({
      insertTypesEntry: true,
      // 指定类型定义文件的输出目录
      outDir: 'dist/package',
    }),
  ],
  build: {
    // 指定打包输出目录
    outDir: 'dist/package',
    // 开启库模式
    lib: {
      // 库的入口文件
      entry: resolve(__dirname, 'src/index.ts'),
      // 在 UMD 模式下，暴露的全局变量名
      name: 'ChatDialogPackage',
      // 输出文件的名称（不包含格式后缀）
      fileName: (format) => `index.${format}`,
      // 支持的格式
      formats: ['es', 'umd'],
    },
    rollupOptions: {
      // 将 react 和 react-dom 作为外部依赖，不打包进库中
      // 这样可以减小包的体积，并避免与宿主应用的版本冲突
      external: ['react', 'react-dom', 'react/jsx-runtime'],
      output: {
        // 为 UMD 格式的构建提供全局变量名
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          'react/jsx-runtime': 'react/jsx-runtime',
        },
      },
    },
    // 生成 sourcemap 文件，方便调试
    sourcemap: true,
    // 在构建前清空输出目录
    emptyOutDir: true,
  },
});
