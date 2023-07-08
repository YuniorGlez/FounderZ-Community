import { createHtmlPlugin } from 'vite-plugin-html';
import compression from 'vite-plugin-compression';

export default {
  plugins: [
    compression(),
    createHtmlPlugin({
      minify: true
    }),
  ],
  root: 'src',
  build: {
    outDir: '../public',
  },
};
