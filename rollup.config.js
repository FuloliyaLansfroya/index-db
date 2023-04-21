// 为了保证版本一致，请复制我的 package.json 到你的项目，并把 name 改成你的库名
import esbuild from 'rollup-plugin-esbuild'
import { terser } from "rollup-plugin-terser"
import alias from '@rollup/plugin-alias'
import path from "path";
import resolve from 'rollup-plugin-node-resolve'

export default {
  input: 'index.ts',
  output: [{
    name: 'index-db-package',
    file: 'dist/lib/index-db-package.js',
    format: 'umd',
  }, {
    name: 'index-db-package',
    file: 'dist/lib/index-db-package.esm.js',
    format: 'es',
  }],
  plugins: [
    esbuild({
      include: /\.[jt]s$/,
      minify: process.env.NODE_ENV === 'production',
      target: 'es2015' 
    }),
    alias({
      entries: [
        {
          find: '@', // 别名名称，作为依赖项目需要使用项目名
          replacement: path.resolve(__dirname), 
          customResolver: resolve({
            extensions: ['.js', '.ts']
          })
        }
      ]
    }),
    terser()
  ],
}
