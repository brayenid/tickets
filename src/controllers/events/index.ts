import type { Response, Request } from 'express'
import type { EventBasic } from '../../interfaces/Events'
import { z } from 'zod'
import { BadRequestError, PrismaError, NotFoundError, AuthError } from '../../utils/Errors'
import {
  addEventService,
  deleteEventService,
  getEventAttendersService,
  getEventByIdService,
  getEventsBySessionService,
  getEventsService,
  getEventsTotalBySessionService,
  getEventsTotalService,
  updateEventService
} from '../../services/events'
import { getUrlPath } from '../../utils/ImgUpload'
import fs from 'fs/promises'
import type { FileRequest } from '../../interfaces/Express'
import path from 'path'
import { groupByAgeFreq } from '../../utils/helpers/GroupAge'
import { groupByGenderFreq } from '../../utils/helpers/GroupGender'
import { getUserCompleteService } from '../../services/users'
import { logger } from '../../utils/Logger'

export const addEvent = async (req: FileRequest, res: Response): Promise<Response> => {
  const { name, date, description, location, vendorId }: EventBasic = req.body
  const thumbnail = getUrlPath(req.file, 8, 9)

  console.log({ thumbnail })

  const id: string = req.fileId ?? ''

  try {
    if (!req.file) {
      throw new BadRequestError('Thumbnail wajib diunggah')
    }
    if (!req.fileId) {
      throw new Error('Server error. ID_NOT_GENERATED')
    }
    const eventSchema = z.object({
      name: z.string(),
      date: z.string(),
      description: z.string(),
      location: z.string(),
      vendorId: z.string()
    })

    eventSchema.parse({
      name,
      date,
      description,
      location,
      vendorId
    })

    await getUserCompleteService(String(vendorId), 'vendor')

    await addEventService({
      name,
      date,
      description,
      location,
      id,
      thumbnail,
      vendorId
    })

    return res.status(201).json({
      status: 'success',
      message: 'Event berhasil dibuat'
    })
  } catch (error: any) {
    if (req.file) {
      await fs.unlink(req.file?.path)
    }
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        status: 'fail',
        message: 'Bad payload',
        issues: error.issues
      })
    }

    if (
      error instanceof PrismaError ||
      error instanceof BadRequestError ||
      error instanceof NotFoundError
    ) {
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
}

export const updateEvent = async (req: Request, res: Response): Promise<Response> => {
  const { date, description, location, name, vendorId, isOpen } = req.body
  const uploadedThumbnail = getUrlPath(req?.file, 8, 9)

  const { eventId: id } = req.params

  try {
    const eventSchema = z.object({
      name: z.string(),
      date: z.string(),
      description: z.string(),
      location: z.string(),
      vendorId: z.string(),
      isOpen: z.boolean()
    })

    eventSchema.parse({
      name,
      date,
      description,
      location,
      vendorId,
      isOpen: Boolean(Number(isOpen))
    })

    /**
     * We need to check whether the latest uploaded file has a different
     * ext. file. If so, we need to remove that current thumbnail with new thumbnail
     * by unlinking the old one
     */
    const { thumbnail: currentThumbnail } = await getEventByIdService(id)

    const isValidPath = (input: string): boolean => {
      const pattern: RegExp = /^uploads\/events\/[a-zA-Z0-9_-]+\.(png|jpg|jpeg|gif)$/i
      return pattern.test(input)
    }

    /**
     * The point is whether the client upload a new file
     * if so, execute this
     */
    if (req.file && currentThumbnail) {
      /**
       * The currentThumbnail value maybe empty or not in the correct format
       * so this regex will validate the input first whether it's in correct format
       * if it's correct, execute the next function.
       */
      if (isValidPath(currentThumbnail)) {
        /* Get the latest uploaded file ext. */
        const currentThumbnailExt = currentThumbnail?.split('/')[2].split('.')[1]

        /* Get the current thumbnail ext. */
        const uploadedThumbnailExt = req.file?.originalname.split('.')[1]

        if (currentThumbnailExt !== uploadedThumbnailExt) {
          await fs.unlink(
            path.resolve(__dirname, '..', '..', '..', 'public', currentThumbnail ?? '')
          )
        }
      }
    }

    await updateEventService({
      id,
      date,
      description,
      location,
      name,
      vendorId,
      thumbnail: req.file ? uploadedThumbnail : currentThumbnail,
      isOpen: Boolean(Number(isOpen))
    })

    return res.status(200).json({
      status: 'success',
      message: 'Event berhasil diubah'
    })
  } catch (error: any) {
    console.log(error)

    if (req.file) {
      await fs.unlink(req.file?.path)
    }
    if (error instanceof z.ZodError) {
      console.log(error)

      return res.status(400).json({
        status: 'fail',
        message: 'Bad payload',
        issues: error.issues
      })
    }

    if (error instanceof PrismaError || error instanceof BadRequestError) {
      return res.status(400).json({
        status: 'fail',
        message: error.message
      })
    }

    if (error instanceof NotFoundError) {
      return res.status(404).json({
        status: 'fail',
        message: error.message
      })
    }

    logger.error(error.message)

    return res.status(500).json({
      status: 'fail',
      message: 'Server error'
    })
  }
}

export const deleteEvent = async (req: Request, res: Response): Promise<Response> => {
  const { eventId } = req.params

  try {
    const thumbnail = await deleteEventService(eventId)
    const thumbnailPath = path.resolve(__dirname, '..', '..', '..', 'public', thumbnail)

    await fs.unlink(thumbnailPath)
    return res.status(200).json({
      status: 'success',
      message: 'Event berhasil dihapus'
    })
  } catch (error: any) {
    if (error instanceof PrismaError || error instanceof BadRequestError) {
      return res.status(400).json({
        status: 'fail',
        message: error.message
      })
    }

    if (error instanceof NotFoundError) {
      return res.status(404).json({
        status: 'fail',
        message: error.message
      })
    }

    console.log(error.message)

    return res.status(500).json({
      status: 'fail',
      message: error.message
    })
  }
}

export const getEvents = async (req: Request, res: Response): Promise<Response> => {
  const { search, limit, page } = req?.query
  const pageNumber: number = page ? Number(page) : 1
  const pageLimit: number = limit ? Number(limit) : 12

  try {
    const events = await getEventsService(search as string, pageLimit, pageNumber)
    const eventsTotal = await getEventsTotalService()

    return res.status(200).json({
      status: 'success',
      meta: {
        length: eventsTotal
      },
      data: events
    })
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        status: 'fail',
        message: 'Bad payload',
        issues: error.issues
      })
    }

    if (error instanceof PrismaError) {
      return res.status(400).json({
        status: 'fail',
        message: error.message
      })
    }

    console.log(error.message)

    return res.status(500).json({
      status: 'fail',
      message: error.message
    })
  }
}

export const getEventById = async (req: Request, res: Response): Promise<Response> => {
  const { eventId } = req.params

  try {
    const eventDetail = await getEventByIdService(eventId)

    if (!eventDetail) {
      throw new NotFoundError('This events is not available')
    }

    return res.status(200).json({
      status: 'success',
      data: eventDetail
    })
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        status: 'fail',
        message: 'Bad payload',
        issues: error.issues
      })
    }

    if (error instanceof PrismaError) {
      return res.status(400).json({
        status: 'fail',
        message: error.message
      })
    }

    if (error instanceof NotFoundError) {
      return res.status(404).json({
        status: 'fail',
        message: error.message
      })
    }

    console.log(error.message)

    return res.status(500).json({
      status: 'fail',
      message: error.message
    })
  }
}

export const getEventAttenders = async (req: Request, res: Response): Promise<Response> => {
  const { eventId } = req.params

  try {
    const isEventValid = await getEventByIdService(eventId)
    if (!isEventValid) {
      throw new BadRequestError('Invalid event')
    }
    const attenders = await getEventAttendersService(eventId)

    return res.status(200).json({
      status: 'success',
      data: attenders
    })
  } catch (error: any) {
    if (error instanceof BadRequestError || error instanceof PrismaError) {
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
}

export const getEventAttendersAge = async (req: Request, res: Response): Promise<Response> => {
  const { eventId } = req.params

  try {
    const attenders = await getEventAttendersService(eventId)
    const attendersAgeMapped = attenders.map((attender) => {
      return {
        age: attender.user.age
      }
    })

    const eventAttendersAgeFreq = groupByAgeFreq(attendersAgeMapped)

    return res.status(200).json({
      status: 'success',
      data: eventAttendersAgeFreq
    })
  } catch (error: any) {
    if (error instanceof BadRequestError || error instanceof PrismaError) {
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
}

export const getEventAttendersGender = async (req: Request, res: Response): Promise<Response> => {
  const { eventId } = req.params

  try {
    const attenders = await getEventAttendersService(eventId)
    const attendersGenderMapped = attenders.map((attender) => {
      return {
        gender: attender.user.gender ?? ''
      }
    })

    const eventAttendersAgeFreq = groupByGenderFreq(attendersGenderMapped)

    return res.status(200).json({
      status: 'success',
      data: eventAttendersAgeFreq
    })
  } catch (error: any) {
    if (error instanceof BadRequestError || error instanceof PrismaError) {
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
}

// VENDOR DASHBOARD
export const addEventBySession = async (req: FileRequest, res: Response): Promise<Response> => {
  const { name, date, description, location }: EventBasic = req.body
  const vendorId = req.session.user?.id
  const thumbnail = getUrlPath(req.file, 8, 9)

  const id: string = req.fileId ?? ''

  try {
    if (!req.file) {
      throw new BadRequestError('Thumbnail wajib diunggah')
    }
    if (!req.fileId) {
      throw new Error('Server error. ID_NOT_GENERATED')
    }
    const eventSchema = z.object({
      name: z.string(),
      date: z.string(),
      description: z.string(),
      location: z.string(),
      vendorId: z.string()
    })

    eventSchema.parse({
      name,
      date,
      description,
      location,
      vendorId
    })

    await getUserCompleteService(String(vendorId), 'vendor')

    await addEventService({
      name,
      date,
      description,
      location,
      id,
      thumbnail,
      vendorId
    })

    return res.status(201).json({
      status: 'success',
      message: 'Event berhasil dibuat'
    })
  } catch (error: any) {
    if (req.file) {
      await fs.unlink(req.file?.path)
    }
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        status: 'fail',
        message: 'Bad payload',
        issues: error.issues
      })
    }

    if (
      error instanceof PrismaError ||
      error instanceof BadRequestError ||
      error instanceof NotFoundError
    ) {
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
}

export const updateEventBySession = async (req: Request, res: Response): Promise<Response> => {
  const { date, description, location, name, isOpen } = req.body
  const vendorId = req.session.user?.id ?? ''
  const uploadedThumbnail = getUrlPath(req?.file, 8, 9)
  const { eventId: id } = req.params

  try {
    const eventSchema = z.object({
      name: z.string(),
      date: z.string(),
      description: z.string(),
      location: z.string(),
      vendorId: z.string(),
      isOpen: z.boolean()
    })

    eventSchema.parse({
      name,
      date,
      description,
      location,
      vendorId,
      isOpen: Boolean(Number(isOpen))
    })

    const { thumbnail: currentThumbnail, vendorId: eventOwner } = await getEventByIdService(id)

    if (vendorId !== eventOwner) {
      throw new AuthError('Anda tidak berhak mengakses sumber daya ini')
    }

    /**
     * We need to check whether the latest uploaded file has a different
     * ext. file. If so, we need to remove that current thumbnail with new thumbnail
     * by unlinking the old one
     */

    const isValidPath = (input: string): boolean => {
      const pattern: RegExp = /^uploads\/events\/[a-zA-Z0-9_-]+\.(png|jpg|jpeg|gif)$/i
      return pattern.test(input)
    }

    /**
     * The point is whether the client upload a new file
     * if so, execute this
     */
    if (req.file && currentThumbnail) {
      /**
       * The currentThumbnail value maybe empty or not in the correct format
       * so this regex will validate the input first whether it's in correct format
       * if it's correct, execute the next function.
       */
      if (isValidPath(currentThumbnail)) {
        /* Get the latest uploaded file ext. */
        const currentThumbnailExt = currentThumbnail?.split('/')[2].split('.')[1]

        /* Get the current thumbnail ext. */
        const uploadedThumbnailExt = req.file?.originalname.split('.')[1]

        if (currentThumbnailExt !== uploadedThumbnailExt) {
          await fs.unlink(
            path.resolve(__dirname, '..', '..', '..', 'public', currentThumbnail ?? '')
          )
        }
      }
    }

    await updateEventService({
      id,
      date,
      description,
      location,
      name,
      vendorId,
      thumbnail: req.file ? uploadedThumbnail : currentThumbnail,
      isOpen: Boolean(Number(isOpen))
    })

    return res.status(200).json({
      status: 'success',
      message: 'Event berhasil diubah'
    })
  } catch (error: any) {
    if (req.file) {
      await fs.unlink(req.file?.path)
    }
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        status: 'fail',
        message: 'Bad payload',
        issues: error.issues
      })
    }

    if (error instanceof PrismaError || error instanceof BadRequestError) {
      return res.status(400).json({
        status: 'fail',
        message: error.message
      })
    }

    if (error instanceof NotFoundError) {
      return res.status(404).json({
        status: 'fail',
        message: error.message
      })
    }

    if (error instanceof AuthError) {
      return res.status(403).json({
        status: 'fail',
        message: error.message
      })
    }

    logger.error(error.message)

    return res.status(500).json({
      status: 'fail',
      message: 'Server error'
    })
  }
}

export const getEventsBySession = async (req: Request, res: Response): Promise<Response> => {
  const { search, limit, page } = req?.query
  const pageNumber: number = page ? Number(page) : 1
  const pageLimit: number = limit ? Number(limit) : 12
  const vendorId = String(req.session.user?.id)

  try {
    const events = await getEventsBySessionService(
      search as string,
      vendorId,
      pageLimit,
      pageNumber
    )
    const eventsTotal = await getEventsTotalBySessionService('', vendorId)

    return res.status(200).json({
      status: 'success',
      meta: {
        length: eventsTotal
      },
      data: events
    })
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        status: 'fail',
        message: 'Bad payload',
        issues: error.issues
      })
    }

    if (error instanceof PrismaError) {
      return res.status(400).json({
        status: 'fail',
        message: error.message
      })
    }

    console.log(error.message)

    return res.status(500).json({
      status: 'fail',
      message: error.message
    })
  }
}
