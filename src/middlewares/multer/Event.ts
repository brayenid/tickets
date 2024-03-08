/* eslint-disable @typescript-eslint/naming-convention */

import multer from 'multer'
import fs from 'fs'
import path from 'path'
import type { NextFunction, Request, Response } from 'express'
import { nanoid } from 'nanoid'
import type { FileRequest } from '../../interfaces/Express'
import type { FileFilterCallback, Multer, StorageEngine } from 'multer'

const eventFileUpload = (storage: StorageEngine): Multer => {
  return multer({
    storage,
    limits: {
      fileSize: 1024 * 1024 // 1 mb
    },
    fileFilter: (req: FileRequest, file: Express.Multer.File, callback: FileFilterCallback) => {
      const ext = path.extname(file.originalname)
      if (ext !== '.jpg' && ext !== '.jpeg' && ext !== '.png' && ext !== '.JPG' && ext !== '.JPEG' && ext !== '.PNG') {
        callback(new Error('Unsupported file type'))
        return
      }
      callback(null, true)
    }
  })
}

/* ADD EVENT */
const eventThumbnailStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const destinationPath = path.resolve(__dirname, '..', '..', '..', 'public', 'uploads', 'events')
    if (!fs.existsSync(destinationPath)) {
      fs.mkdirSync(destinationPath, { recursive: true })
    }
    cb(null, destinationPath)
  },

  filename: (req: FileRequest, file, cb) => {
    const id = nanoid(32)

    const getIndexLength = file.originalname.split('.').length
    const fileExt = file.originalname.split('.')[getIndexLength - 1]

    req.fileId = id
    cb(null, `${id}.${fileExt}`)
  }
})
const eventThumbnailUpload = eventFileUpload(eventThumbnailStorage)
const eventThumbnail = eventThumbnailUpload.single('eventThumbnail')

export const eventThumbnailMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  eventThumbnail(req, res, async (error) => {
    if (error) {
      if (error instanceof multer.MulterError) {
        return res.status(400).json({
          status: 'fail',
          message: error.message
        })
      }

      return res.status(500).json({
        status: 'fail',
        message: error.message
      })
    }

    next()
  })
}

/* UPDATE EVENT */
const updateEventThumbnailStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const destinationPath = path.resolve(__dirname, '..', '..', '..', 'public', 'uploads', 'events')
    if (!fs.existsSync(destinationPath)) {
      fs.mkdirSync(destinationPath, { recursive: true })
    }
    cb(null, destinationPath)
  },

  filename: (req: FileRequest, file, cb) => {
    const id = req.params.eventId

    const getIndexLength = file.originalname.split('.').length
    const fileExt = file.originalname.split('.')[getIndexLength - 1]

    cb(null, `${id}.${fileExt}`)
  }
})
const updateEventThumbnailUpload = eventFileUpload(updateEventThumbnailStorage)
const updateEventThumbnail = updateEventThumbnailUpload.single('eventThumbnail')

export const updateEventThumbnailMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  updateEventThumbnail(req, res, async (error) => {
    if (error) {
      if (error instanceof multer.MulterError) {
        return res.status(400).json({
          status: 'fail',
          message: error.message
        })
      }

      return res.status(500).json({
        status: 'fail',
        message: error.message
      })
    }

    next()
  })
}
