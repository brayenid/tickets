import fs from 'fs'
import path from 'path'
import { logger } from './Logger'

const ticketFolderPath = 'public/tickets'

export const deleteOldFiles = async (): Promise<void> => {
  try {
    const files = await fs.promises.readdir(ticketFolderPath)
    const currentTime = Date.now()
    const tenMinutesAgo = currentTime - 10 * 60 * 1000 // 10 minutes in milliseconds

    for (const file of files) {
      const filePath = path.join(ticketFolderPath, file)
      const stats = await fs.promises.stat(filePath)

      // Check if the file was modified more than 10 minutes ago
      if (stats.mtimeMs < tenMinutesAgo) {
        await fs.promises.unlink(filePath) // Delete the file
      }
    }
  } catch (err) {
    logger.warn(err)
  }
}
