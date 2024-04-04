import type { Request, Response } from 'express'
import { getEventByIdService, getEventsService, getEventsTotalService } from '../../services/events'
import {
  getUserCompleteService,
  getUsersByRoleService,
  getUsersByRoleTotalService
} from '../../services/users'
import { getEventPriceByEventIdService } from '../../services/event-prices'

export const main = (req: Request, res: Response): void => {
  res.render('dashboard/main', {
    title: 'Dashboard',
    layout: 'dashboard'
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
    eventPrices
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
    vendor
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

  const vendor = await getUserCompleteService(userId, 'vendor')

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
    vendor
  })
}
