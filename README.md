# unplugin-dns-prefetch

Automatically collect the domain name in the code and insert it into the head of html

## Usage

Vite
```javascript
// vite.config.ts
import { defineConfig } from 'vite'
import dnsPrefetchPlugin from 'unplugin-prefetch-dns/vite'
import vue from '@vitejs/plugin-vue'
import type { PluginOption } from 'vite'
export default defineConfig({
  plugins: [
    vue(),
    dnsPrefetchPlugin(),
  ],
})
```

Webpack
```javascript
// webpack.config.js
module.exports = {
  plugins: [
    require('unplugin-prefetch-dns/webpack').default,
  ],
}
```

Vue CLI
```javascript
// vue.config.js
module.exports = {
  configureWebpack: {
    plugins: [
      require('unplugin-prefetch-dns/webpack').default
    ],
  },
}
```
