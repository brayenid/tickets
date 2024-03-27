import type { Request, Response } from 'express'
import { getEventByIdService } from '../../services/events'
import { getEventPriceByEventIdService } from '../../services/event-prices'

export const eventDetail = async (req: Request, res: Response): Promise<void> => {
  const { eventId } = req.params
  const event = await getEventByIdService(eventId)
  const eventPrices = await getEventPriceByEventIdService(eventId)

  res.render('events/event-detail', {
    title: 'Event Detail',
    event,
    eventPrices
  })
}
