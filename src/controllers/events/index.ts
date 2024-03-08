import type { Response, Request } from 'express'
import type { EventBasic } from '../../interfaces/Events'
import { z } from 'zod'
import { BadRequestError, PrismaError, NotFoundError } from '../../utils/Errors'
import { addEventService, getEventByIdService, getEventsService } from '../../services/events'
import { getUrlPath } from '../../utils/ImgUpload'
import fs from 'fs/promises'
import type { FileRequest } from '../../interfaces/Express'

export const addEvent = async (req: FileRequest, res: Response): Promise<Response> => {
  const { name, date, description, location }: EventBasic = req.body
  const thumbnail = getUrlPath(req.file, 8, 9)

  const id: string = req.fileId ?? ''

  try {
    if (!req.file) {
      throw new BadRequestError('Thumbnail is required')
    }
    if (!req.fileId) {
      throw new Error('Server error. ID_NOT_GENERATED')
    }
    const eventSchema = z.object({
      name: z.string(),
      date: z.string(),
      description: z.string(),
      location: z.string()
    })

    eventSchema.parse({
      name,
      date,
      description,
      location
    })

    await addEventService({ name, date, description, location, id, thumbnail })

    return res.status(200).json({
      status: 'success',
      message: 'Event created successfully'
    })
  } catch (error: any) {
    if (req.file) {
      await fs.unlink(req.file?.path)
    }
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        status: 'fail',
        message: error.issues
      })
    }

    if (error instanceof PrismaError || error instanceof BadRequestError) {
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

export const getEvents = async (req: Request, res: Response): Promise<Response> => {
  const { search, limit, page } = req?.query
  const pageNumber: number = page ? Number(page) : 1
  const pageLimit: number = limit ? Number(limit) : 12

  try {
    const events = await getEventsService(search as string, pageLimit, pageNumber)

    return res.status(200).json({
      status: 'success',
      data: events
    })
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        status: 'fail',
        message: error.issues
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

    if (eventDetail.length < 1) {
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
        message: error.issues
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
