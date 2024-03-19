/**
 *
 * @param input ID structure is : (prefix-random_number-date)
 */

import { customAlphabet } from 'nanoid'

export const generateId = (prefix: string): string => {
  const dateToday = new Date()

  const today = `${String(dateToday.getDate()).padStart(2, '0')}${String(dateToday.getMonth() + 1).padStart(
    2,
    '0'
  )}${dateToday.getFullYear()}`
  const pattern = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890'
  const randomId = customAlphabet(pattern, 16)

  const result = `${prefix}-${randomId()}-${today}`

  return result
}
