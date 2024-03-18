import type { MailVerification } from '../../interfaces/EmailVerification'
import { BadRequestError } from '../../utils/Errors'
import { redis } from '../../utils/Redis'

/**
 *
 * setKeyService to store the email, key (token) as an object to redis
 */
export const setKeyService = async (payload: MailVerification): Promise<void> => {
  const { email, key } = payload

  const obj = {
    email,
    key
  }
  await redis.del(`email:${email}`)
  await redis.setex(`email:${email}`, 300, JSON.stringify(obj))
}

/**
 *
 * verifyEmailToKey to verify whether the key that stored by the client is valid.
 * It also sets a new key-value pair email-id which is used in the process of verifying email to token id.
 * @param setEmailId default : true, to set a new key value email-id
 */

export const verifyEmailToKey = async (payload: MailVerification, setEmailId: boolean = true): Promise<void> => {
  const { email, key, id } = payload
  const storedToken = (await redis.get(`email:${email}`)) ?? '{}'
  const tokenJson: MailVerification = JSON.parse(storedToken)

  if (tokenJson.key !== key) {
    throw new BadRequestError('Invalid token')
  }
  if (!id) {
    throw new Error('Invalid token ID')
  }
  await redis.del(`email:${email}`)
  if (setEmailId) {
    await redis.setex(`email-id:${email}`, 1800, id)
  }
}

/**
 *
 * verifyEmailToTokenId is to make a proper register, to ensure that the client
 * has verify its token properly. Every POST request that the client made will be attached with
 * id value we got when we set the email:xxx.com value. That id will be used to be compared here.
 */
export const verifyEmailToTokenId = async (payload: MailVerification): Promise<void> => {
  const { email, id } = payload

  const storedId = await redis.get(`email-id:${email}`)

  if (storedId !== id) {
    throw new BadRequestError('Your register session is not valid or has been expired, register again')
  }

  await redis.del(`email-id:${email}`)
}
