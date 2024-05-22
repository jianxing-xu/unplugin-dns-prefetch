import { defineConfig } from 'vite'
import Inspect from 'vite-plugin-inspect'
import UnpluginPrefetchDns from 'unplugin-prefetch-dns/vite'
import Unplugin from '../src/vite'

export default defineConfig({
  plugins: [
    Inspect(),
    Unplugin(),
    UnpluginPrefetchDns(),
  ],
})
