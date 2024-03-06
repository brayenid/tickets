/* eslint-disable @typescript-eslint/no-useless-constructor */
class PrismaError extends Error {
  constructor(message: string) {
    super(message)
  }
}

class AuthError extends Error {
  constructor(message: string) {
    super(message)
  }
}

class NotFoundError extends Error {
  constructor(message: string) {
    super(message)
  }
}

class BadRequestError extends Error {
  constructor(message: string) {
    super(message)
  }
}

class ForbiddenError extends Error {
  constructor(message: string) {
    super(message)
  }
}

export { PrismaError, AuthError, NotFoundError, BadRequestError, ForbiddenError }
