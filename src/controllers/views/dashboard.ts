import type { Request, Response } from 'express'
import { getEventByIdService, getEventsService, getEventsTotalService } from '../../services/events'
import {
  getUserByIdService,
  getUserCompleteService,
  getUsersByRoleService,
  getUsersByRoleTotalService
} from '../../services/users'
import {
  getEventPriceByEventIdService,
  getEventPriceByIdService
} from '../../services/event-prices'
import {
  getOrderByIdService,
  getOrdersTotalAmountService,
  getsOrdersService,
  getsOrdersTotalService
} from '../../services/orders'
import {
  getTicketByIdService,
  getTicketTotalService,
  getTicketsService
} from '../../services/tickets'
import type { EventPricePayload } from '../../interfaces/EventPrice'
import { PrismaError } from '../../utils/Errors'
import { getOfflineSaleCapabilityService } from '../../services/account-atribute'

export const main = async (req: Request, res: Response): Promise<void> => {
  const eventsTotal = await getEventsTotalService()
  const ticketsTotal = await getTicketTotalService()
  const customersTotal = await getUsersByRoleTotalService('', 'customer')
  const vendorsTotal = await getUsersByRoleTotalService('', 'vendor')

  res.render('dashboard/main', {
    title: 'Dashboard',
    layout: 'dashboard',
    eventsTotal,
    ticketsTotal,
    customersTotal,
    vendorsTotal
  })
}

// EVENTS
export const createEvent = async (req: Request, res: Response): Promise<void> => {
  const { search, page } = req.query

  const limitPage = 9
  const searchQuery = search ? String(search) : ''
  const pageQuery = page ? Number(page) : 1
  const prevPage = pageQuery - 1
  const nextPage = pageQuery + 1

  const paths = [
    {
      label: 'Events',
      url: '/dashboard/events'
    }
  ]

  const eventsTotal = await getEventsTotalService(searchQuery)

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

  const events = await getEventsService(searchQuery, limitPage, pageQuery)
  const vendors = await getUsersByRoleService('', 'vendor')

  res.render('dashboard/events/create-event', {
    title: 'Create Event',
    paths,
    layout: 'dashboard',
    events,
    prevPage,
    nextPage,
    pageQuery,
    totalPages: countTotalPage(),
    vendors,
    isPrevPageMoreThanZero: isPrevPageMoreThanZero(),
    isNotReachLastPage: isTotalPagesMoreThanNextPage(),
    search: searchQuery
  })
}

export const eventSummaryDashboard = async (req: Request, res: Response): Promise<void> => {
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
      url: '/dashboard/events'
    },
    {
      label: event.name,
      url: `/dashboard/events/${event.id}`
    }
  ]

  res.render('dashboard/events/event-summary', {
    title: `Event Summary - ${event.name}`,
    event,
    layout: 'dashboard',
    paths,
    vendors,
    eventPrices,
    eventsTotalCash,
    eventsTotalOfflineCash
  })
}

export const eventDetailDashboard = async (req: Request, res: Response): Promise<void> => {
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

  const paths = [
    {
      label: 'Events',
      url: '/dashboard/events'
    },
    {
      label: event.name,
      url: `/dashboard/events/${event.id}`
    },
    {
      label: 'Detail',
      url: `/dashboard/events/${event.id}/detail`
    }
  ]

  res.render('dashboard/events/event-detail', {
    title: `Event Detail - ${event.name}`,
    event,
    layout: 'dashboard',
    paths,
    vendors,
    eventPrices
  })
}

export const eventPriceDetail = async (req: Request, res: Response): Promise<void> => {
  const { eventPriceId, eventId } = req.params

  try {
    const { name, price, stock, grade } = await getEventPriceByIdService(eventPriceId)
    const { name: eventName } = await getEventByIdService(eventId)

    const paths = [
      {
        label: 'Events',
        url: '/dashboard/events'
      },
      {
        label: eventName,
        url: `/dashboard/events/${eventId}`
      },
      {
        label: 'Detail',
        url: `/dashboard/events/${eventId}/detail`
      },
      {
        label: 'Detail Kategori Harga',
        url: `/dashboard/events/${eventId}/event-price/${eventPriceId}`
      }
    ]

    res.render('dashboard/events/event-price-detail', {
      title: 'Detail Kategori Harga',
      paths,
      layout: 'dashboard',
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

// VENDORS
export const createVendors = async (req: Request, res: Response): Promise<void> => {
  const { search, page } = req.query

  const limitPage = 9
  const searchQuery = search ? String(search) : ''
  const pageQuery = page ? Number(page) : 1
  const prevPage = pageQuery - 1
  const nextPage = pageQuery + 1

  const paths = [
    {
      label: 'Vendors',
      url: '/dashboard/vendors'
    }
  ]

  const vendorsTotal = await getUsersByRoleTotalService(searchQuery, 'vendor')

  /* LOGIC STUF */
  const isPrevPageMoreThanZero = (): boolean => {
    if (prevPage > 0) {
      return true
    }

    return false
  }

  const countTotalPage = (): number => {
    if (vendorsTotal < limitPage) {
      return 1
    }
    const divideTotalToLimit = vendorsTotal / limitPage
    return Math.ceil(divideTotalToLimit)
  }

  const isTotalPagesMoreThanNextPage = (): boolean => {
    if (nextPage <= countTotalPage()) {
      return true
    }
    return false
  }

  const vendors = await getUsersByRoleService(searchQuery, 'vendor', limitPage, pageQuery)

  res.render('dashboard/vendors/create-vendor', {
    title: 'Create Vendor',
    paths,
    layout: 'dashboard',
    prevPage,
    nextPage,
    pageQuery,
    totalPages: countTotalPage(),
    vendors,
    isPrevPageMoreThanZero: isPrevPageMoreThanZero(),
    isNotReachLastPage: isTotalPagesMoreThanNextPage(),
    search: searchQuery
  })
}

export const vendorDetailDashboard = async (req: Request, res: Response): Promise<void> => {
  const { userId } = req.params

  const vendor = await getUserCompleteService(userId, 'vendor')
  const offlineSaleCapability = await getOfflineSaleCapabilityService(userId)

  if (!vendor.id) {
    res.status(404).render('errors/not-found', {
      title: 404,
      layout: 'plain'
    })
    return
  }

  const paths = [
    {
      label: 'Vendors',
      url: '/dashboard/vendors'
    },
    {
      label: `Vendor Detail : ${vendor.name}`,
      url: `/dashboard/vendors/${userId}`
    }
  ]

  res.render('dashboard/vendors/vendor-detail', {
    title: `Event Detail - ${vendor.name}`,
    layout: 'dashboard',
    paths,
    vendor,
    offlineSaleCapability
  })
}

// CUSTOMERS
export const createCustomer = async (req: Request, res: Response): Promise<void> => {
  const { search, page } = req.query

  const limitPage = 9
  const searchQuery = search ? String(search) : ''
  const pageQuery = page ? Number(page) : 1
  const prevPage = pageQuery - 1
  const nextPage = pageQuery + 1

  const paths = [
    {
      label: 'Customers',
      url: '/dashboard/customers'
    }
  ]

  const customersTotal = await getUsersByRoleTotalService(searchQuery, 'customer')

  /* LOGIC STUF */
  const isPrevPageMoreThanZero = (): boolean => {
    if (prevPage > 0) {
      return true
    }

    return false
  }

  const countTotalPage = (): number => {
    if (customersTotal < limitPage) {
      return 1
    }
    const divideTotalToLimit = customersTotal / limitPage
    return Math.ceil(divideTotalToLimit)
  }

  const isTotalPagesMoreThanNextPage = (): boolean => {
    if (nextPage <= countTotalPage()) {
      return true
    }
    return false
  }

  const customers = await getUsersByRoleService(searchQuery, 'customer', limitPage, pageQuery)

  res.render('dashboard/customers/create-customer', {
    title: 'Create Customer',
    paths,
    layout: 'dashboard',
    prevPage,
    nextPage,
    pageQuery,
    totalPages: countTotalPage(),
    customers,
    isPrevPageMoreThanZero: isPrevPageMoreThanZero(),
    isNotReachLastPage: isTotalPagesMoreThanNextPage(),
    search: searchQuery
  })
}

export const customerDetailDashboard = async (req: Request, res: Response): Promise<void> => {
  const { userId } = req.params

  const customer = await getUserCompleteService(userId, 'customer')

  if (!customer.id) {
    res.status(404).render('errors/not-found', {
      title: 404,
      layout: 'plain'
    })
    return
  }

  const paths = [
    {
      label: 'Customers',
      url: '/dashboard/customers'
    },
    {
      label: `Customer Detail : ${customer.name}`,
      url: `/dashboard/customers/${userId}`
    }
  ]

  res.render('dashboard/customers/customer-detail', {
    title: `Event Detail - ${customer.name}`,
    layout: 'dashboard',
    paths,
    customer
  })
}

// ORDERS
export const orderList = async (req: Request, res: Response): Promise<void> => {
  const { search, page, status } = req.query

  const limitPage = 9
  const searchQuery = search ? String(search) : ''
  const pageQuery = page ? Number(page) : 1
  const statusQuery = status ? String(status) : ''
  const prevPage = pageQuery - 1
  const nextPage = pageQuery + 1

  const paths = [
    {
      label: 'Orders',
      url: '/dashboard/orders'
    }
  ]

  const ordersTotal = await getsOrdersTotalService(searchQuery, statusQuery)

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

  const orders = await getsOrdersService(searchQuery, statusQuery, limitPage, pageQuery)

  res.render('dashboard/orders/order-list', {
    title: 'Order List',
    paths,
    layout: 'dashboard',
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

export const orderDetailDashboard = async (req: Request, res: Response): Promise<void> => {
  const { orderId } = req.params
  const order = await getOrderByIdService(orderId)

  const paths = [
    {
      label: 'Daftar Order',
      url: '/dashboard/orders'
    },
    {
      label: 'Detail Order',
      url: `/dashboard/orders/${orderId}`
    }
  ]

  const isOrderSettled = !!(order.status === 'settlement' || order.status === 'capture')

  res.render('dashboard/orders/order-detail', {
    title: 'Detail Order',
    layout: 'dashboard',
    order,
    paths,
    isOrderSettled
  })
}

// Tickets
export const ticketList = async (req: Request, res: Response): Promise<void> => {
  const { search, page } = req.query

  const limitPage = 9
  const searchQuery = search ? String(search) : ''
  const pageQuery = page ? Number(page) : 1
  const prevPage = pageQuery - 1
  const nextPage = pageQuery + 1

  const paths = [
    {
      label: 'Orders',
      url: '/dashboard/orders'
    }
  ]

  const ticketsTotal = await getTicketTotalService(searchQuery)

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

  const tickets = await getTicketsService(searchQuery, limitPage, pageQuery)

  res.render('dashboard/tickets/ticket-list', {
    title: 'Ticket List',
    paths,
    layout: 'dashboard',
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

export const ticketDetailDashboard = async (req: Request, res: Response): Promise<void> => {
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
      layout: 'dashboard',
      userName
    })
  } catch (error: any) {
    res.status(404).render('errors/not-found', {
      title: 404,
      layout: 'plain'
    })
  }
}

export const ticketActivation = (req: Request, res: Response): void => {
  const paths = [
    {
      label: 'Aktivasi Tiket',
      url: '/dashboard/ticket-activation'
    }
  ]

  res.render('dashboard/tickets/ticket-activation', {
    title: 'Aktivasi Tiket',
    layout: 'dashboard',
    paths
  })
}

// OFFLINE SALE
export const offlineSale = async (req: Request, res: Response): Promise<void> => {
  const events = await getEventsService()
  const customer = await getUsersByRoleService('', 'user')

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
      url: '/dashboard/offline-sale'
    }
  ]

  res.render('dashboard/offline-sale/offline-sale', {
    title: 'Pembelian Offline',
    layout: 'dashboard',
    paths,
    events,
    customer,
    eventIdQuery,
    userIdQuery,
    isUserValid,
    isEventValid,
    isBasicInputValid: isEventValid && isUserValid,
    eventPrices
  })
}

// SUDO AREA
export const createAdmin = async (req: Request, res: Response): Promise<void> => {
  const { search, page } = req.query

  const limitPage = 9
  const searchQuery = search ? String(search) : ''
  const pageQuery = page ? Number(page) : 1
  const prevPage = pageQuery - 1
  const nextPage = pageQuery + 1

  const paths = [
    {
      label: 'Admins',
      url: '/sudo/admins'
    }
  ]

  const adminsTotal = await getUsersByRoleTotalService(searchQuery, 'admin')

  /* LOGIC STUF */
  const isPrevPageMoreThanZero = (): boolean => {
    if (prevPage > 0) {
      return true
    }

    return false
  }

  const countTotalPage = (): number => {
    if (adminsTotal < limitPage) {
      return 1
    }
    const divideTotalToLimit = adminsTotal / limitPage
    return Math.ceil(divideTotalToLimit)
  }

  const isTotalPagesMoreThanNextPage = (): boolean => {
    if (nextPage <= countTotalPage()) {
      return true
    }
    return false
  }

  const admins = await getUsersByRoleService(searchQuery, 'admin', limitPage, pageQuery)

  res.render('dashboard/admins/create-admin', {
    title: 'Create Admin',
    paths,
    layout: 'dashboard',
    prevPage,
    nextPage,
    pageQuery,
    totalPages: countTotalPage(),
    admins,
    isPrevPageMoreThanZero: isPrevPageMoreThanZero(),
    isNotReachLastPage: isTotalPagesMoreThanNextPage(),
    search: searchQuery
  })
}

export const adminDetailDashboard = async (req: Request, res: Response): Promise<void> => {
  const { userId } = req.params

  const admin = await getUserCompleteService(userId, 'admin')

  if (!admin.id) {
    res.status(404).render('errors/not-found', {
      title: 404,
      layout: 'plain'
    })
    return
  }

  const paths = [
    {
      label: 'Admins',
      url: '/sudo/admins'
    },
    {
      label: `Admin Detail : ${admin.name}`,
      url: `/sudo/admins/${userId}`
    }
  ]

  res.render('dashboard/admins/admin-detail', {
    title: `Event Detail - ${admin.name}`,
    layout: 'dashboard',
    paths,
    admin
  })
}

export const resetPassword = (req: Request, res: Response): void => {
  const paths = [
    {
      label: 'Reset Password',
      url: '/sudo/credential'
    }
  ]

  res.render('dashboard/reset-password/reset-password', {
    title: 'Reset Password',
    paths,
    layout: 'dashboard'
  })
}
