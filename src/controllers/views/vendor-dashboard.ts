import type { Request, Response } from 'express'
import {
  getEventByIdService,
  getEventsBySessionService,
  getEventsTotalBySessionService
} from '../../services/events'
import { getUserByIdService, getUsersByRoleService } from '../../services/users'
import {
  getEventPriceByEventIdService,
  getEventPriceByIdService
} from '../../services/event-prices'
import {
  getOrderByIdService,
  getOrdersTotalAmountService,
  getsOrdersTotalVendorService,
  getsOrdersVendorService
} from '../../services/orders'
import { PrismaError } from '../../utils/Errors'
import {
  getTicketByIdService,
  getTicketTotalServiceVendor,
  getTicketsServiceVendor
} from '../../services/tickets'
import type { EventPricePayload } from '../../interfaces/EventPrice'
import { getOfflineSaleCapabilityService } from '../../services/account-atribute'

// EVENTS
export const createEventVendor = async (req: Request, res: Response): Promise<void> => {
  const { search, page } = req.query
  const vendorId = req.session.user?.id ?? ''

  const limitPage = 9
  const searchQuery = search ? String(search) : ''
  const pageQuery = page ? Number(page) : 1
  const prevPage = pageQuery - 1
  const nextPage = pageQuery + 1

  const paths = [
    {
      label: 'Events',
      url: '/vendor/dashboard/events'
    }
  ]

  const eventsTotal = await getEventsTotalBySessionService(searchQuery, vendorId)

  /* LOGIC STUF */
  const isPrevPageMoreThanZero = (): boolean => {
    if (prevPage > 0) {
      return true
    }

    return false
  }

  const countTotalPage = (): number => {
    if (eventsTotal < limitPage) {
      return 1
    }
    const divideTotalToLimit = eventsTotal / limitPage
    return Math.ceil(divideTotalToLimit)
  }

  const isTotalPagesMoreThanNextPage = (): boolean => {
    if (nextPage <= countTotalPage()) {
      return true
    }
    return false
  }

  const events = await getEventsBySessionService(searchQuery, vendorId, limitPage, pageQuery)

  res.render('vendor-dashboard/events/create-event', {
    title: 'Semua Event',
    paths,
    layout: 'vendor-dashboard',
    events,
    prevPage,
    nextPage,
    pageQuery,
    totalPages: countTotalPage(),
    isPrevPageMoreThanZero: isPrevPageMoreThanZero(),
    isNotReachLastPage: isTotalPagesMoreThanNextPage(),
    search: searchQuery
  })
}

export const eventSummaryDashboardVendor = async (req: Request, res: Response): Promise<void> => {
  const { eventId } = req.params

  const event = await getEventByIdService(eventId)

  if (!event.id) {
    res.status(404).render('errors/not-found', {
      title: 404,
      layout: 'plain'
    })
    return
  }

  const vendors = await getUsersByRoleService('', 'vendor')
  const eventPrices = await getEventPriceByEventIdService(eventId)
  const eventsTotalCash = await getOrdersTotalAmountService(eventId)
  const eventsTotalOfflineCash = await getOrdersTotalAmountService(eventId, 'offline')

  const paths = [
    {
      label: 'Events',
      url: '/vendor/dashboard/events'
    },
    {
      label: event.name,
      url: `/vendor/dashboard/events/${event.id}`
    }
  ]

  res.render('vendor-dashboard/events/event-summary', {
    title: `Ikhtisar Event - ${event.name}`,
    event,
    layout: 'vendor-dashboard',
    paths,
    vendors,
    eventPrices,
    eventsTotalCash,
    eventsTotalOfflineCash
  })
}

export const eventDetailDashboardVendor = async (req: Request, res: Response): Promise<void> => {
  const { eventId } = req.params

  const event = await getEventByIdService(eventId)

  if (!event.id) {
    res.status(404).render('errors/not-found', {
      title: 404,
      layout: 'plain'
    })
    return
  }

  const eventPrices = await getEventPriceByEventIdService(eventId)

  const paths = [
    {
      label: 'Events',
      url: '/vendor/dashboard/events'
    },
    {
      label: event.name,
      url: `/vendor/dashboard/events/${event.id}`
    },
    {
      label: 'Detail',
      url: `/vendor/dashboard/events/${event.id}/detail`
    }
  ]

  res.render('vendor-dashboard/events/event-detail', {
    title: `Event Detail - ${event.name}`,
    event,
    layout: 'vendor-dashboard',
    paths,
    eventPrices
  })
}

export const eventPriceDetailVendor = async (req: Request, res: Response): Promise<void> => {
  const { eventPriceId, eventId } = req.params

  try {
    const { name, price, stock, grade } = await getEventPriceByIdService(eventPriceId)
    const { name: eventName } = await getEventByIdService(eventId)

    const paths = [
      {
        label: 'Events',
        url: '/vendor/dashboard/events'
      },
      {
        label: eventName,
        url: `/vendor/dashboard/events/${eventId}`
      },
      {
        label: 'Detail',
        url: `/vendor/dashboard/events/${eventId}/detail`
      },
      {
        label: 'Detail Kategori Harga',
        url: `/vendor/dashboard/events/${eventId}/event-price/${eventPriceId}`
      }
    ]

    res.render('vendor-dashboard/events/event-price-detail', {
      title: 'Detail Kategori Harga',
      paths,
      layout: 'vendor-dashboard',
      name,
      price,
      stock,
      grade,
      eventPriceId
    })
  } catch (error: any) {
    if (error instanceof PrismaError) {
      res.status(404).render('errors/not-found', {
        title: 404,
        layout: 'plain'
      })
    }
  }
}

// ORDERS
export const orderListVendor = async (req: Request, res: Response): Promise<void> => {
  const { search, page, status } = req.query
  const session = req.session.user

  const limitPage = 9
  const searchQuery = search ? String(search) : ''
  const pageQuery = page ? Number(page) : 1
  const statusQuery = status ? String(status) : ''
  const prevPage = pageQuery - 1
  const nextPage = pageQuery + 1

  const paths = [
    {
      label: 'Orders',
      url: '/vendor/dashboard/orders'
    }
  ]

  const ordersTotal = await getsOrdersTotalVendorService(
    searchQuery,
    statusQuery,
    String(session?.id)
  )

  /* LOGIC STUF */
  const isPrevPageMoreThanZero = (): boolean => {
    if (prevPage > 0) {
      return true
    }

    return false
  }

  const countTotalPage = (): number => {
    if (ordersTotal < limitPage) {
      return 1
    }
    const divideTotalToLimit = ordersTotal / limitPage
    return Math.ceil(divideTotalToLimit)
  }

  const isTotalPagesMoreThanNextPage = (): boolean => {
    if (nextPage <= countTotalPage()) {
      return true
    }
    return false
  }

  const orders = await getsOrdersVendorService(
    searchQuery,
    statusQuery,
    limitPage,
    pageQuery,
    String(session?.id)
  )

  res.render('vendor-dashboard/orders/order-list', {
    title: 'Order List',
    paths,
    layout: 'vendor-dashboard',
    prevPage,
    nextPage,
    pageQuery,
    totalPages: countTotalPage(),
    orders,
    isPrevPageMoreThanZero: isPrevPageMoreThanZero(),
    isNotReachLastPage: isTotalPagesMoreThanNextPage(),
    search: searchQuery
  })
}

export const orderDetailDashboardVendor = async (req: Request, res: Response): Promise<void> => {
  const { orderId } = req.params
  const order = await getOrderByIdService(orderId)

  const paths = [
    {
      label: 'Daftar Order',
      url: '/vendor/dashboard/orders'
    },
    {
      label: 'Detail Order',
      url: `/vendor/dashboard/orders/${orderId}`
    }
  ]

  const isOrderSettled = !!(order.status === 'settlement' || order.status === 'capture')

  res.render('vendor-dashboard/orders/order-detail', {
    title: 'Detail Order',
    layout: 'vendor-dashboard',
    order,
    paths,
    isOrderSettled
  })
}

// Tickets
export const ticketListVendor = async (req: Request, res: Response): Promise<void> => {
  const { search, page } = req.query

  const limitPage = 9
  const searchQuery = search ? String(search) : ''
  const pageQuery = page ? Number(page) : 1
  const prevPage = pageQuery - 1
  const nextPage = pageQuery + 1

  const vendorId = String(req.session.user?.id)

  const paths = [
    {
      label: 'Orders',
      url: '/dashboard/orders'
    }
  ]

  const ticketsTotal = await getTicketTotalServiceVendor(searchQuery, vendorId)

  /* LOGIC STUF */
  const isPrevPageMoreThanZero = (): boolean => {
    if (prevPage > 0) {
      return true
    }

    return false
  }

  const countTotalPage = (): number => {
    if (ticketsTotal < limitPage) {
      return 1
    }
    const divideTotalToLimit = ticketsTotal / limitPage
    return Math.ceil(divideTotalToLimit)
  }

  const isTotalPagesMoreThanNextPage = (): boolean => {
    if (nextPage <= countTotalPage()) {
      return true
    }
    return false
  }

  const tickets = await getTicketsServiceVendor(searchQuery, limitPage, pageQuery, vendorId)

  res.render('vendor-dashboard/tickets/ticket-list', {
    title: 'Ticket List',
    paths,
    layout: 'vendor-dashboard',
    prevPage,
    nextPage,
    pageQuery,
    totalPages: countTotalPage(),
    tickets,
    isPrevPageMoreThanZero: isPrevPageMoreThanZero(),
    isNotReachLastPage: isTotalPagesMoreThanNextPage(),
    search: searchQuery
  })
}

export const ticketDetailDashboardVendor = async (req: Request, res: Response): Promise<void> => {
  const { ticketId } = req.params
  try {
    const ticket = await getTicketByIdService(ticketId)
    const { name: userName } = await getUserByIdService(ticket.userId ?? '')
    const paths = [
      {
        label: 'Daftar Tiket',
        url: '/dashboard/tickets'
      },
      {
        label: `Ticket ${ticket.event.name}`,
        url: `/dashboard/tickets/${ticketId}`
      }
    ]

    res.render('dashboard/tickets/ticket-detail', {
      title: `${ticket.event.name} Ticket`,
      paths,
      ticket,
      layout: 'vendor-dashboard',
      userName
    })
  } catch (error: any) {
    res.status(404).render('errors/not-found', {
      title: 404,
      layout: 'plain'
    })
  }
}

export const ticketActivationVendor = (req: Request, res: Response): void => {
  const paths = [
    {
      label: 'Aktivasi Tiket',
      url: '/vendor/dashboard/ticket-activation'
    }
  ]

  res.render('vendor-dashboard/tickets/ticket-activation', {
    title: 'Aktivasi Tiket',
    layout: 'vendor-dashboard',
    paths
  })
}

// OFFLINE SALE
export const offlineSaleVendor = async (req: Request, res: Response): Promise<void> => {
  const vendorId = String(req.session.user?.id)
  const events = await getEventsBySessionService('', vendorId)
  const customer = await getUsersByRoleService('', 'user')

  const isCapable = await getOfflineSaleCapabilityService(vendorId)

  const { eventId, userId } = req.query
  const eventIdQuery = eventId ? String(eventId) : ''
  const userIdQuery = userId ? String(userId) : ''

  let isUserValid: boolean = false
  let isEventValid: boolean = false
  let eventPrices: EventPricePayload[] = []

  if (eventId && userId) {
    const event = await getEventByIdService(eventIdQuery)
    eventPrices = await getEventPriceByEventIdService(eventIdQuery)

    if (event.id) {
      isEventValid = true
    } else {
      isEventValid = false
    }

    try {
      await getUserByIdService(userIdQuery)
      isUserValid = true
    } catch (error) {
      isUserValid = false
    }
  }

  const paths = [
    {
      label: 'Pembelian Offline',
      url: '/vendor/dashboard/offline-sale'
    }
  ]

  res.render('vendor-dashboard/offline-sale/offline-sale', {
    title: 'Pembelian Offline',
    layout: 'vendor-dashboard',
    paths,
    events,
    customer,
    eventIdQuery,
    userIdQuery,
    isUserValid,
    isEventValid,
    isBasicInputValid: isEventValid && isUserValid,
    eventPrices,
    isCapable
  })
}
