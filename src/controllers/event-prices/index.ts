import type { Request, Response } from 'express'
import { nanoid } from 'nanoid'
import { BadRequestError, NotFoundError, PrismaError } from '../../utils/Errors'
import {
  addEventPriceService,
  deleteEventPriceService,
  getEventPriceByEventIdService
} from '../../services/event-prices'
import { z } from 'zod'

export const addEventPrice = async (req: Request, res: Response): Promise<Response> => {
  const { name, price, eventId, stock, grade } = req.body
  const id = nanoid(16)

  try {
    const payloadSchema = z.object({
      name: z.string(),
      price: z.number(),
      eventId: z.string(),
      stock: z.number(),
      grade: z.number()
    })

    payloadSchema.parse({ name, price, eventId, stock, grade })

    await addEventPriceService({ id, name, price, eventId, stock, grade })

    return res.status(201).json({
      status: 'success',
      message: 'Kategori harga baru berhasil dibuat'
    })
  } catch (error: any) {
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

export const getEventPriceByEventId = async (req: Request, res: Response): Promise<Response> => {
  const { eventId } = req.params

  try {
    const eventPrices = await getEventPriceByEventIdService(eventId)

    return res.status(200).json({
      status: 'success',
      data: eventPrices
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

export const deleteEventPrice = async (req: Request, res: Response): Promise<Response> => {
  const { eventPriceId } = req.params

  try {
    await deleteEventPriceService(eventPriceId)

    return res.status(200).json({
      status: 'success',
      message: 'Kategori harga berhasil dihapus'
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
