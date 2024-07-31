import fs from 'fs'
import path from 'path'
import { PDFDocument, rgb } from 'pdf-lib'

const generatePDF = async (html: string, outputPath: string): Promise<void> => {
  try {
    const pdfDoc = await PDFDocument.create()
    const page = pdfDoc.addPage()
    const fontSize = 12
    const color = rgb(0, 0, 0)
    const text = html.replace(/<[^>]+>/g, '')

    page.drawText(text, {
      x: 50,
      y: page.getHeight() - 50 - fontSize,
      size: fontSize,
      color: color,
      maxWidth: page.getWidth() - 100,
    })

    const pdfBytes = await pdfDoc.save()
    fs.writeFileSync(outputPath, pdfBytes)
  } catch (error) {
    console.error('Error generating PDF:', error)
    throw error
  }
}

export default generatePDF
