import type { Request, Response } from 'express'
import { nanoid } from 'nanoid'
import { AuthError, BadRequestError, NotFoundError, PrismaError } from '../../utils/Errors'
import {
  addEventPriceService,
  deleteEventPriceService,
  getEventPriceByEventIdService,
  getEventPriceByIdService,
  updateEventPriceService
} from '../../services/event-prices'
import { z } from 'zod'
import { logger } from '../../utils/Logger'
import { getTransactionByOrderIdService } from '../../services/transaction'
import { getEventByIdService } from '../../services/events'

export const addEventPrice = async (req: Request, res: Response): Promise<Response> => {
  const { name, price, eventId, stock, grade } = req.body
  const id = nanoid(16)
  const session = req.session.user

  try {
    const payloadSchema = z.object({
      name: z.string(),
      price: z.number(),
      eventId: z.string(),
      stock: z.number(),
      grade: z.number()
    })

    payloadSchema.parse({ name, price, eventId, stock, grade })

    const event = await getEventByIdService(eventId as string)
    const accessList = ['admin', 'sudo']

    if (session?.id !== event.vendorId && !accessList.includes(String(session?.role))) {
      throw new AuthError('Kamu tidak memiliki akses pada sumber daya ini')
    }

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

    if (error instanceof AuthError) {
      return res.status(403).json({
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
  const session = req.session.user

  try {
    const { vendorId: eventOwner } = await getEventPriceByIdService(eventPriceId)

    const accessList = ['admin', 'sudo']

    if (session?.id !== eventOwner && !accessList.includes(String(session?.role))) {
      throw new AuthError('Kamu tidak memiliki akses melihat sumber daya ini')
    }
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

    logger.error(error.message)

    return res.status(500).json({
      status: 'fail',
      message: error.message
    })
  }
}

export const evaluateEventPriceStock = async (req: Request, res: Response): Promise<Response> => {
  const { orderId } = req.params

  try {
    const transactions = await getTransactionByOrderIdService(orderId)

    for (const transaction of transactions) {
      const eventPrice = await getEventPriceByIdService(transaction.eventPriceId ?? '')

      if ((transaction.quantity ?? 0) > eventPrice.stock) {
        throw new BadRequestError(
          `Pembelian tiket ${eventPrice.name} melewati stok. Coba lagi atau belanja ulang`
        )
      }
    }

    return res.status(200).json({
      status: 'success',
      message: 'Oke'
    })
  } catch (error: any) {
    if (error instanceof BadRequestError) {
      // Throw 200 to avoid being printed on console
      return res.status(200).json({
        status: 'fail',
        message: error.message
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

    logger.error(error.message)

    return res.status(500).json({
      status: 'fail',
      message: error.message
    })
  }
}

export const updateEventPrice = async (req: Request, res: Response): Promise<Response> => {
  const { name, price, grade, stock } = req.body
  const { eventPriceId } = req.params
  const session = req.session.user

  try {
    const payloadSchema = z.object({
      name: z.string(),
      price: z.number(),
      grade: z.number(),
      stock: z.number()
    })

    const { id, vendorId } = await getEventPriceByIdService(eventPriceId)

    if (!id) {
      throw new BadRequestError('Invalid request')
    }

    const accessList = ['admin', 'sudo']

    if (session?.id !== vendorId && !accessList.includes(String(session?.role))) {
      throw new AuthError('Kamu tidak memiliki akses pada sumber daya ini')
    }

    payloadSchema.parse({
      name,
      price,
      grade,
      stock
    })

    await updateEventPriceService(eventPriceId, {
      name,
      price,
      grade,
      stock
    })

    return res.status(200).json({
      status: 'success',
      message: 'Kategori harga berhasil diperbaharui'
    })
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        status: 'fail',
        message: 'Bad payload',
        issues: error.issues
      })
    }

    if (error instanceof BadRequestError) {
      return res.status(400).json({
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
