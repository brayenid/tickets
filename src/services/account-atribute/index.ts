import { prisma } from '../../utils/Db'

/**
 * This function is a toggle button to change the offline capability value
 */
export const setOfflineSaleCapabilityService = async (vendorId: string): Promise<boolean> => {
  const attribute = await prisma.accountAttributes.findFirst({
    select: {
      id: true,
      offlineSale: true
    },
    where: {
      vendorId
    }
  })

  if (!attribute?.id) {
    const status = await prisma.accountAttributes.create({
      data: {
        offlineSale: true,
        vendorId
      }
    })
    return status.offlineSale
  }

  const status = await prisma.accountAttributes.update({
    select: {
      offlineSale: true
    },
    data: {
      offlineSale: !attribute.offlineSale
    },
    where: {
      vendorId
    }
  })

  return status.offlineSale
}

export const getOfflineSaleCapabilityService = async (vendorId: string): Promise<boolean> => {
  const attribute = await prisma.accountAttributes.findFirst({
    select: {
      id: true,
      offlineSale: true
    },
    where: {
      vendorId
    }
  })

  return attribute?.offlineSale || false
}
