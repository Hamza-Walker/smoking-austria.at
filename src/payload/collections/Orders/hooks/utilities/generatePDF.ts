import pdf from 'html-pdf'

export const generatePDF = (html: string, outputPath: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    pdf.create(html).toFile(outputPath, (err, res) => {
      if (err) {
        return reject(err)
      }
      // Ensure the resolved value is the file path as a string
      resolve(res.filename)
    })
  })
}
