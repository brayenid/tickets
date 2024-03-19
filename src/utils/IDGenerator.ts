import { customAlphabet } from 'nanoid'

/**
 *
 * @param input ID structure is : (prefix-random_number-date)
 * @param length Pattern length
 */
export const generateId = (prefix: string, length: number = 16): string => {
  const dateToday = new Date()

  const today = `${String(dateToday.getDate()).padStart(2, '0')}${String(dateToday.getMonth() + 1).padStart(
    2,
    '0'
  )}${dateToday.getFullYear()}`
  const pattern = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890'
  const randomId = customAlphabet(pattern, length)

  const result = `${prefix}-${randomId()}-${today}`

  return result
}

export const generateIdSimple = (length: number = 16): string => {
  const pattern = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890'
  const randomId = customAlphabet(pattern, length)

  return randomId()
}
