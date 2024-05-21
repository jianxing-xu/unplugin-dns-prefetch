import fs from 'node:fs/promises'
import type { UnpluginFactory } from 'unplugin'
import { createUnplugin } from 'unplugin'
import urlRegex from 'url-regex'
import type { Options } from './types'

export const unpluginFactory: UnpluginFactory<Options | undefined> = () => {
  const htmlTemplatePaths = [] as string[][]
  const urls = new Set<string>()
  const URL_REG = /https:\/\/[^/]*/i
  return {
    name: 'unplugin-starter',
    enforce: 'post',

    writeBundle(options: void) {
      const { dir } = options as any

      // eslint-disable-next-line prefer-rest-params
      const files = Object.keys(arguments[1])

      Promise.all(files.map(async (fileName) => {
        const content = await fs.readFile(`${dir}/${fileName}`, 'utf-8')

        // save .html path & content
        if (fileName.endsWith('.html'))
          htmlTemplatePaths.push([`${dir}/${fileName}`, content])

        // match url
        const matches = content.match(urlRegex({ strict: true }))
        if (!matches)
          return
        matches?.forEach((m) => {
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
    },
  }
}

export const unplugin = /* #__PURE__ */ createUnplugin(unpluginFactory)

export default unplugin
