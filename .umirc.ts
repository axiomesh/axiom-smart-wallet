import { defineConfig } from "umi";
const baseUrl = '/';

export default defineConfig({
  title: 'AxiomWallet',
  jsMinifier: 'terser',
  // proxy: {
  //   '/api': {
  //     target: 'http://172.16.13.132:8480/',
  //     changeOrigin: true,
  //   },
  // },
  base: baseUrl,
  publicPath: baseUrl,
  lessLoader: {
    javascriptEnabled: true,
  },
  hash: true,
  targets: {
    ie: 11,
    chrome: 49,
    firefox: 45,
    safari: 10,
    edge: 13,
    ios: 10,
  },
  history: {
    type: 'browser',
  },
  routes: [
    { path: '/', redirect: '/login' },
    {
      path: '/login',
      component: '@/pages/login',
      layout: false,
    },
    {
      path: '/verify-code',
      component: '@/pages/login/verify-code',
      layout: false,
    },
    {
      path: '/privacy',
      component: '@/pages/agreement/privacy',
      layout: false
    },
    { path: '/*', component: '@/pages/404', layout: false }
  ],
  npmClient: 'yarn',
});
