import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'url';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
    // 加载 .env 文件中的环境变量
    // FIX: Cast `process` to `any` to work around a TypeScript error about a missing `cwd` property, likely due to a misconfigured environment (e.g., missing @types/node).
    const env = loadEnv(mode, (process as any).cwd(), '');

    return {
      // 重要！为 GitHub Pages 部署设置基础路径。
      // 请将 '<你的仓库名称>' 替换为你在 GitHub 上的实际仓库名称。
      // 例如，如果你的仓库 URL 是 https://github.com/your-name/math-quiz-app
      // 那么这里应该设置为 '/math-quiz-app/'
      base: '/sxwdxt/',

      plugins: [react()],

      // 定义全局常量替换，这对于在客户端代码中安全地使用环境变量至关重要
      define: {
        'process.env.API_KEY': JSON.stringify(env.API_KEY),
      },

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
    };
});
