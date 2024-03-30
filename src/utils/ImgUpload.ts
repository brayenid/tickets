import { config } from './Config'

export const getUrlPath = (
  fullPath: Express.Multer.File | undefined,
  start: number,
  end: number
): string => {
  if (!fullPath) {
    return 'NO_FULLPATH' // Atau tindakan lain sesuai kebutuhan Anda ketika req.file adalah undefined
  }

  if (config.env === 'dev') {
    return fullPath.path.split('\\').splice(start, end).join('/')
  } else {
    return fullPath.path.split('/').splice(start, end).join('/')
  }
}
