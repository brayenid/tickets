import type { Request, Response } from 'express'
import { getEventByIdService } from '../../services/events'
import { getEventPriceByEventIdService } from '../../services/event-prices'
import { config } from '../../utils/Config'

export const eventDetail = async (req: Request, res: Response): Promise<void> => {
  const { eventId } = req.params
  const event = await getEventByIdService(eventId)
  const eventPrices = await getEventPriceByEventIdService(eventId)

  const paths = [
    {
      label: event.name,
      url: `/events/${eventId}`
    }
  ]

  res.render('events/event-detail', {
    title: `${event.name} - Kita Loket`,
    event,
    eventPrices,
    paths,
    fullPath: `${config.protocol}${config.host}`
  })
}
