import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

const getGoogleTagManagerId = (mode: string): string => {
  const env = loadEnv(mode, process.cwd(), '');
  const id = env.VITE_GTM_ID || env.VITE_GTAG_ID || '';
  const normalizedId = id.trim().toUpperCase();

  if (!normalizedId) {
    return '';
  }

  if (!/^GTM-[A-Z0-9]+$/.test(normalizedId)) {
    console.warn('VITE_GTM_ID must be a Google Tag Manager container ID such as GTM-XXXXXXX.');
    return '';
  }

  return normalizedId;
};

const googleTagManagerPlugin = (containerId: string): Plugin => ({
  name: 'google-tag-manager',
  transformIndexHtml() {
    if (!containerId) {
      return [];
    }

    return [
      {
        tag: 'script',
        children: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${containerId}');`,
        injectTo: 'head-prepend',
      },
      {
        tag: 'noscript',
        children: `<iframe src="https://www.googletagmanager.com/ns.html?id=${containerId}" height="0" width="0" style="display:none;visibility:hidden"></iframe>`,
        injectTo: 'body-prepend',
      },
    ];
  },
});

export default defineConfig(({ mode }) => ({
  plugins: [react(), googleTagManagerPlugin(getGoogleTagManagerId(mode))],
}));
