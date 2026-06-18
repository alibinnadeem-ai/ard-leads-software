import fs from 'node:fs/promises'
import path from 'node:path'
import Script from 'next/script'

function extractBetween(source, start, end) {
  const from = source.indexOf(start)
  if (from === -1) return ''
  const contentStart = from + start.length
  const to = source.indexOf(end, contentStart)
  if (to === -1) return source.slice(contentStart)
  return source.slice(contentStart, to)
}

async function getLegacyMarkup() {
  const htmlPath = path.join(process.cwd(), 'ard_platform_v3_5.html')
  const html = await fs.readFile(htmlPath, 'utf8')
  const styles = extractBetween(html, '<style>', '</style>')
  const body = extractBetween(html, '<body>', '<script>')

  return { styles, body }
}

export default async function HomePage() {
  const { styles, body } = await getLegacyMarkup()

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <div dangerouslySetInnerHTML={{ __html: body }} />
      <div id="fb-root" />

      <Script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js" strategy="beforeInteractive" />
      <Script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js" strategy="beforeInteractive" />
      <Script src="/ard-platform.js" strategy="afterInteractive" />
      <Script
        src="https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v19.0"
        strategy="lazyOnload"
        crossOrigin="anonymous"
      />
      <Script src="https://www.instagram.com/embed.js" strategy="lazyOnload" />
      <Script src="https://www.tiktok.com/embed.js" strategy="lazyOnload" />
    </>
  )
}
