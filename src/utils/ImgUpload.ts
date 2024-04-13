import { config } from './Config'

export const getUrlPath = (fullPath: Express.Multer.File | undefined): string => {
  if (!fullPath) {
    return 'NO_FULLPATH' // Atau tindakan lain sesuai kebutuhan Anda ketika req.file adalah undefined
  }

  if (config.env === 'dev') {
    const splitPath = fullPath.path.split('\\')
    return splitPath[splitPath.length - 1]
  } else {
    const splitPath = fullPath.path.split('/')
    return splitPath[splitPath.length - 1]
  }
}
