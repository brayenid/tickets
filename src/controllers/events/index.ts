import type { Response, Request } from 'express'
import type { EventBasic } from '../../interfaces/Events'
import { z } from 'zod'
import { BadRequestError, PrismaError, NotFoundError } from '../../utils/Errors'
import {
  addEventService,
  deleteEventService,
  getEventAttendersService,
  getEventByIdService,
  getEventsService,
  updateEventService
} from '../../services/events'
import { getUrlPath } from '../../utils/ImgUpload'
import fs from 'fs/promises'
import type { FileRequest } from '../../interfaces/Express'
import path from 'path'
import { groupByAgeFreq } from '../../utils/helpers/GroupAge'
import { groupByGenderFreq } from '../../utils/helpers/GroupGender'

export const addEvent = async (req: FileRequest, res: Response): Promise<Response> => {
  const { name, date, description, location, vendor }: EventBasic = req.body
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
      location: z.string(),
      vendor: z.string()
    })

    eventSchema.parse({
      name,
      date,
      description,
      location,
      vendor
    })

    await addEventService({ name, date, description, location, id, thumbnail, vendor })

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

export const updateEvent = async (req: Request, res: Response): Promise<Response> => {
  const { date, description, location, name, vendor } = req.body
  const { eventId: id } = req.params

  try {
    const eventSchema = z.object({
      name: z.string(),
      date: z.string(),
      description: z.string(),
      location: z.string(),
      vendor: z.string()
    })

    eventSchema.parse({
      name,
      date,
      description,
      location,
      vendor
    })

    await updateEventService({ id, date, description, location, name, vendor })

    return res.status(200).json({
      status: 'success',
      message: 'Event updated successfully'
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

    console.log(error.message)

    return res.status(500).json({
      status: 'fail',
      message: error.message
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
      message: 'Event successfully deleted'
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
