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
      path: '/set-password',
      component: '@/pages/login/set-password',
      layout: false,
    },
    {
      path: '/reset-password',
      component: '@/pages/login/set-password',
      layout: false,
    },
    {
      path: '/security/reset-unlock-password',
      component: '@/pages/security/set-password',
    },
    {
      path: '/security/forget-password',
      component: '@/pages/security/forget-password',
    },
    {
      path: '/security/verify',
      component: '@/pages/security/verify-code',
    },
    {
      path: '/security/update-password',
      component: '@/pages/security/update-password',
    },
    {
      path: '/security/update-reset-password',
      component: '@/pages/security/update-password',
    },
    {
      path: '/login-password',
      component: '@/pages/login/login-password',
      layout: false,
    },
    {
      path: '/lock-password',
      component: '@/pages/login/login-password',
      layout: false,
    },
    {
      path: '/home',
      component: '@/pages/home',
    },
    {
      path: '/transfer',
      component: '@/pages/transfer',
    },
    {
      path: '/transfer-history',
      component: '@/pages/transfer/history',
    },
    {
      path: '/verify-code',
      component: '@/pages/login/verify-code',
      layout: false,
    },
    {
      path: '/reset-verify-code',
      component: '@/pages/login/verify-code',
      layout: false,
    },
    {
      path: '/lock',
      component: '@/pages/login/lock',
      layout: false,
    },
    {
      path: '/privacy',
      component: '@/pages/agreement/privacy',
      layout: false
    },
    {
      path: '/security',
      component: '@/pages/security',
    },
    {
      path: '/contact',
      component: '@/pages/contact',
    },
    {
      path: '/reset-transfer',
      component: '@/pages/reset-transfer',
    },
    {
      path: '/transfer-free',
      component: '@/pages/transfer-free',
    },
    { path: '/*', component: '@/pages/404', layout: false }
  ],
  npmClient: 'yarn',
});
