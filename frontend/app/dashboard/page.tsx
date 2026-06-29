const fs = require('fs')
const path = require('path')

async function getHTML() {
  try {
    const htmlPath = path.join(process.cwd(), 'public', 'pages', `${page}.html`)
    return fs.readFileSync(htmlPath, 'utf-8')
  } catch {
    return ''
  }
}

export default async function Page() {
  const html = await getHTML()
  return <div dangerouslySetInnerHTML={{ __html: html }} />
}
