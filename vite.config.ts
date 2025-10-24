import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'url';

// https://vitejs.dev/config/
export default defineConfig({
  // 重要！为 GitHub Pages 部署设置基础路径。
  // 这个值必须是 /<你的仓库名称>/，并与 package.json 中的 homepage 仓库名一致。
  base: '/sxwdxt/',

  plugins: [react()],

  // 配置开发服务器
  server: {
    port: 3000,
    host: '0.0.0.0', // 允许通过网络访问
  },

  // 配置路径别名，方便导入
  resolve: {
    alias: {
      // FIX: Replaced `__dirname` with an ESM-compatible equivalent using `import.meta.url`, as `__dirname` is not available in ES modules.
      '@': path.resolve(path.dirname(fileURLToPath(import.meta.url)), './'),
    }
  }
});
