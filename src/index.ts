import fs from 'node:fs/promises'
import type { UnpluginFactory } from 'unplugin'
import { createUnplugin } from 'unplugin'
import urlRegex from 'url-regex'
import type { Compiler } from 'webpack'
import type { Options } from './types'

const PLUGIN_NAME = 'unplugin-prefetch-dns:webpack'

const URL_REG = /https:\/\/[^/]*/i

export const unpluginFactory: UnpluginFactory<Options | undefined> = () => {
  const htmlTemplatePaths = [] as string[][]
  const urls = new Set<string>()

  function process(dir: string, filePaths: string[]) {
    htmlTemplatePaths.length = 0
    urls.clear()
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
    })).then(() => {
      // insert url
      if (urls.size === 0)
        return
      let links = [...urls].map(url => `<link rel="dns-prefetch" href="${url}">`)
      for (const [path, content] of htmlTemplatePaths) {
        const headS = content.indexOf('<head>')
        const headE = content.indexOf('</head>')
        const headStr = content.slice(headS - 1, headE + 1)
        links = links.filter((link) => {
          return !headStr.includes(link)
        })
        if (!links.length)
          return
        const newHTML = content.replace(/(<head[^>]*>)/, (_, head) => `${head}\n  ${links.join('\n ')}`)
        fs.writeFile(path, newHTML, 'utf-8')
      }
    })
  }

  return {
    name: PLUGIN_NAME,
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
      compiler.hooks.afterEmit.tapAsync({ name: PLUGIN_NAME }, async (stats) => {
        const path = stats.outputOptions.path
        const fileNames = stats.assetsInfo.keys()
        process(path!, [...fileNames])
      })
    },
  }
}

export const unplugin = /* #__PURE__ */ createUnplugin(unpluginFactory)

export default unplugin
