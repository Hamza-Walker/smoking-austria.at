import Handlebars from 'handlebars'
import fs from 'fs'
import inlineCSS from 'inline-css'
import path from 'path'

const template = fs.readFileSync(path.join(__dirname, './emailTemplate.html'), 'utf8')
const getHTML = Handlebars.compile(template)

const generateEmailHTML = async (data): Promise<string> => {
  const preInlinedCSS = getHTML(data)
  const html = await inlineCSS(preInlinedCSS, {
    url: ' ',
    removeStyleTags: false,
  })
  return html
}

export default generateEmailHTML
