import fs from 'node:fs/promises'
import type { UnpluginFactory } from 'unplugin'
import { createUnplugin } from 'unplugin'
import urlRegex from 'url-regex'
import type { Compiler } from 'webpack'
import type { Options } from './types'

const PLUGIN_NAME = 'unplugin-dns-prefetch:webpack'

export const unpluginFactory: UnpluginFactory<Options | undefined> = () => {
  const htmlTemplatePaths = [] as string[][]
  const urls = new Set<string>()
  const URL_REG = /https:\/\/[^/]*/i

  function process(dir: string, filePaths: string[]) {
    return Promise.all(filePaths.map(async (fileName) => {
      const content = await fs.readFile(`${dir}/${fileName}`, 'utf-8')

      // save .html path & content
      if (fileName.endsWith('.html'))
        htmlTemplatePaths.push([`${dir}/${fileName}`, content])

      // match url
      const matches = content.match(urlRegex({ strict: true }))
      if (!matches)
        return
      matches?.forEach((m: any) => {
        const matched = m.match(URL_REG)
        if (matched)
          urls.add(matched[0])
      })

      if (urls.size === 0)
        return

      // insert url
      const links = [...urls].map(url => `<link rel="dns-prefetch" href="${url}">`).join('\n  ')
      for (const [path, content] of htmlTemplatePaths) {
        const newHTML = content.replace(/(<head[^>]*>)/, (_, head) => `${head}\n  ${links}`)
        await fs.writeFile(path, newHTML, 'utf-8')
      }
    }))
  }

  return {
    name: 'unplugin-prefetch-dns',
    enforce: 'post',
    vite: {
      writeBundle: {
        handler(options, bundle) {
          const { dir } = options
          const files = Object.keys(bundle)
          process(dir!, files)
        },
      },
    },
    webpack(compiler: Compiler) {
      compiler.hooks.done.tapAsync({ name: PLUGIN_NAME }, async (stats) => {
        const path = stats.compilation.outputOptions.path
        const fileNames = stats.compilation.assetsInfo.keys()
        await process(path!, [...fileNames])
      })
    },
  }
}

export const unplugin = /* #__PURE__ */ createUnplugin(unpluginFactory)

export default unplugin
