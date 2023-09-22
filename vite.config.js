import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'


export default defineConfig({
    base: './',
    plugins: [vue()],
    optimizeDeps: {
        include: ['schart.js']
    },
    //设置跨域请求
    server: {
        proxy: {
            '/prefix': {
                target: 'http://localhost:8080', // 接口基地址
                changeOrigin: true,
                rewrite: path => {
                    console.log(path);
                    return path.replace(/^\/prefix/, '');
                },
                '/usr': {
                    target: 'http://localhost:8080',
                    // changeOrigin: true,
                    rewrite: (path) => path.replace(/^\/usr/, '')
                }
            }
        },
        define: {
            'process.env': process.env
        }
    }
})