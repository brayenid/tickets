import crypto from 'crypto'

export const createHash = (data: string): string => {
  const hashed = crypto.createHash('sha512')
  hashed.update(data)
  return hashed.digest('hex')
}
