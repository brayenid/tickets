import type { OrderOutput } from '../../interfaces/Order'

interface Output {
  time: string
  freq: number
}

const formatTimestamp = (timestamp: number): string => {
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec'
  ]

  const date = new Date(timestamp)
  const day = date.getDate().toString().padStart(2, '0')
  const monthIndex = date.getMonth()
  const month = months[monthIndex]

  return `${day} ${month}`
}

export const groupByDay = (transactions: OrderOutput[]): Output[] => {
  const groupedTransactions: Record<string, Output> = {}

  transactions.forEach((transaction) => {
    const date = new Date(transaction.updatedAt ?? '')
    const day: string = formatTimestamp(
      new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()
    )

    if (!groupedTransactions[day]) {
      groupedTransactions[day] = {
        time: day,
        freq: 0
      }
    }

    groupedTransactions[day].freq++
  })

  return Object.values(groupedTransactions)
}
