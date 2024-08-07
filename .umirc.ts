import { defineConfig } from "umi";
const baseUrl = '/';

export default defineConfig({
  title: 'AxiomWallet',
  jsMinifier: 'terser',
  proxy: {
    '/api/v2': {
      target: 'http://10.2.69.126:8080',
      changeOrigin: true,
      // pathRewrite: {
      //   '^/api/v2': '',
      // }
    },
    '/api/axm-wallet': {
      // target: 'http://10.2.69.157:8580',
      target: 'http://10.2.69.208:8581',
      changeOrigin: true,
    },
    '/api/ticker': {
      target: 'http://94.74.111.72/price-aggregator/',
      changeOrigin: true,
    },
    '/api/node': {
      target: 'http://10.2.69.244:28881',
      changeOrigin: true,
      pathRewrite: {
        '^/api/node': '',
      }
    },
    '/api/bundler': {
      target: 'http://10.2.69.244:4337',
      changeOrigin: true,
      pathRewrite: {
        '^/api/bundler': '',
      }
    },
    'api/ws': {
      target: 'http://10.2.69.208:8581',
      changeOrigin: true,
      pathRewrite: {
        '^/api/ws': '',
      }
    },
    // '/websocket': {
    //   target: 'http://172.16.13.133:8581',
    //   changeOrigin: true,
    // },
  },
  base: baseUrl,
  publicPath: baseUrl,
  lessLoader: {
    javascriptEnabled: true,
  },
  headScripts: [
      { src: 'env.js', defer: true, async: true },
      {src: 'https://cdnjs.cloudflare.com/ajax/libs/sockjs-client/1.5.1/sockjs.min.js', defer: true, async: true},
      {src: 'https://cdnjs.cloudflare.com/ajax/libs/stomp.js/2.3.3/stomp.min.js', defer: true, async: true}
  ],
  plugins: ['@umijs/plugins/dist/dva'],
  dva: {},
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
      path: '/login-password',
      component: '@/pages/login/login-password',
      layout: false,
    },
    {
      path: '/login-passkey',
      component: '@/pages/login/login-passkey',
      layout: false,
    },
    {
      path: '/register-passkey',
      component: '@/pages/login/login-passkey',
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
    },{
      path: '/nft-detail',
      component: '@/pages/home/detail',
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
    {
      path: '/bio-payment',
      component: '@/pages/bio-payment',
    },
    {
      path: '/passkey-security',
      component: '@/pages/passkey-security',
    },
    { path: '/*', component: '@/pages/404', layout: false }
  ],
  npmClient: 'yarn',
});
