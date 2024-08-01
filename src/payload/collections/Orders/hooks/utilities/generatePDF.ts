import fs from 'fs'
import htmlPdfNode from 'html-pdf-node'

export const generatePDF = async (html: string, outputPath: string): Promise<string> => {
  const file = { content: html }
  const options = {
    format: 'A4',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'], // Add --disable-gpu here
    executablePath: '/usr/bin/chromium-browser', // Update this path if needed
  }

  return new Promise<string>((resolve, reject) => {
    htmlPdfNode
      .generatePdf(file, options)
      .then((pdfBuffer: Buffer) => {
        fs.writeFile(outputPath, pdfBuffer, err => {
          if (err) {
            reject(err)
          } else {
            resolve(outputPath)
          }
        })
      })
      .catch(reject)
  })
}
