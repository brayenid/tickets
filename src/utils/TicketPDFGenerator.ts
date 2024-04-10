import { PDFDocument, rgb } from 'pdf-lib'
import { promises as fsPromises } from 'fs'
import path from 'path'
import fontkit from '@pdf-lib/fontkit'
import QRcode from 'qrcode'
import { formatISODate } from './helpers/HbsHelpers'
import type { TicketOutput } from '../interfaces/Tickets'
import { logger } from './Logger'

export const generateTicketDirectRes = async (
  ticketDetail: TicketOutput
): Promise<Buffer | undefined> => {
  try {
    // Create QR based on ticket id
    const qr = await QRcode.toDataURL(ticketDetail.id)

    // Fetch Fonts
    const antonioRegularUrl = await readFileToBuffer(
      path.resolve(__dirname, 'assets', 'Antonio-Regular.ttf')
    )
    const antonioBoldUrl = await readFileToBuffer(
      path.resolve(__dirname, 'assets', 'Antonio-Bold.ttf')
    )

    // Load existed pdf as ticket base
    const existingPdfBytes = await readFileToBuffer(path.resolve(__dirname, 'assets', 'base.pdf'))
    const pdfDoc = await PDFDocument.load(existingPdfBytes)
    pdfDoc.registerFontkit(fontkit)

    // Embed font
    const antonioRegular = await pdfDoc.embedFont(antonioRegularUrl)
    const antonioBold = await pdfDoc.embedFont(antonioBoldUrl)

    const pages = pdfDoc.getPages()
    const page = pages[0]
    const eventNameSize = 30
    const eventCatSize = 14
    const eventDateSize = 14

    // DETAIL
    const eventName = cutString(String(ticketDetail.event.name).toUpperCase(), 30)
    const eventCat = String(ticketDetail.category).toUpperCase()
    const eventDate = formatISODate(ticketDetail.event.date)

    // Draw a string of text
    page.drawText(eventName, {
      x: 18.7,
      y: 155,
      size: eventNameSize,
      font: antonioBold,
      color: rgb(255 / 255, 255 / 255, 255 / 255)
    })

    page.drawText(eventCat, {
      x: 20,
      y: 135,
      size: eventCatSize,
      font: antonioBold,
      color: rgb(255 / 255, 255 / 255, 255 / 255)
    })

    page.drawText(eventDate, {
      x: 70,
      y: 40,
      size: eventDateSize,
      font: antonioRegular,
      color: rgb(0 / 255, 0 / 255, 0 / 255)
    })

    page.drawText('Location :', {
      x: 230,
      y: 80,
      size: 12,
      font: antonioRegular,
      color: rgb(255 / 255, 255 / 255, 255 / 255)
    })

    printMultipleText({
      longText: String(ticketDetail.event.location),
      fontSize: 10,
      lineHeight: 15,
      width: 7,
      page,
      font: antonioRegular
    })

    page.drawText(ticketDetail.id, {
      x: 500,
      y: 46,
      size: 7.8,
      font: antonioRegular,
      color: rgb(0 / 255, 0 / 255, 0 / 255)
    })

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const qrImage = await pdfDoc.embedPng(qr)

    // Set QR Position
    const qrX = 500
    const qrY = 60
    const qrImageWidth = 90
    const qrImageHeight = 90
    page.drawImage(qrImage, { x: qrX, y: qrY, width: qrImageWidth, height: qrImageHeight })

    /**
     * pdfBytes return an Uint8Array data, not compatible and cannot be return as
     * a response to the client, thus it has to be converted into Buffer.
     */
    const pdfBytes = await pdfDoc.save()
    const pdfBuffer = Buffer.from(pdfBytes.buffer)

    return pdfBuffer
  } catch (error: any) {
    logger.error(error.message)
  }
}

const cutString = (text: string, limit: number): string => {
  if (text.length <= limit) {
    return text
  } else {
    return text.slice(0, limit)
  }
}

const splitText = (text: string, limit: number): string[] => {
  try {
    const words = text.split(' ')
    const result = []
    let currentLine = ''

    for (let i = 0; i < words.length; i++) {
      if (currentLine.split(' ').length <= limit) {
        currentLine += words[i] + ' '
      } else {
        result.push(currentLine.trim())
        currentLine = words[i] + ' '
      }
    }

    // Push sisa kata terakhir
    if (currentLine !== '') {
      result.push(currentLine.trim())
    }

    return result
  } catch (error) {
    return [text]
  }
}

interface MultiText {
  longText: string
  fontSize: number
  lineHeight: number
  width: number
  font: any
  page: any
}

/**
 * To make a multiple line text that printed on the canvas
 * because it will not automatically wrap into a new line
 * the strategy is simple, just split the long text into array of strings
 * using splitText(), and then make a loop and print it
 */
const printMultipleText = ({
  longText,
  fontSize,
  lineHeight,
  width,
  font,
  page
}: MultiText): void => {
  let currentLinePos = 0
  const text = splitText(longText, width)
  for (let i = 0; i < text.length; i++) {
    page.drawText(`${text[i]}`, {
      x: 230,
      y: 60 + currentLinePos,
      size: fontSize || 10,
      font,
      color: rgb(255 / 255, 255 / 255, 255 / 255)
    })

    currentLinePos -= lineHeight
  }
}

const readFileToBuffer = async (filePath: string): Promise<Buffer> => {
  return await new Promise((resolve, reject) => {
    fsPromises
      .readFile(filePath)
      .then((buffer) => {
        resolve(buffer)
      })
      .catch((error) => {
        reject(new Error(`Error reading file: ${error}`))
      })
  })
}
