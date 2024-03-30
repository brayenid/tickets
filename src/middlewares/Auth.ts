import type { Request, Response, NextFunction } from 'express'
import { AuthError, BadRequestError, ForbiddenError } from '../utils/Errors'
import { prisma } from '../utils/Db'

type AuthSide = 'view' | 'json'

/**
 * Make a role.
 *
 * @param role String that represents what role is permitted to access the resource.
 * @param fallbackRole Array of string that consist of fallback roles if the first validation fail.
 * @param authSide Determine what response the server send
 * Example: new Role('admin', ['user', 'guest'])
 */

class Auth {
  constructor(
    public role: string,
    public fallbackRole: string[] = [],
    public authSide: AuthSide = 'json'
  ) {
    this.role = role
    this.fallbackRole = fallbackRole
    this.authSide = authSide
  }

  public validateSession = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | undefined> => {
    const session = req.session.user

    try {
      if (!session) {
        return res.status(403).json({
          status: 'fail',
          message: 'Unauthenticated, please login'
        })
      }

      next()
    } catch (error: any) {
      return res.status(500).json({
        status: 'fail',
        message: error.message
      })
    }
  }

  public validate = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | undefined> => {
    const session = req.session.user
    try {
      const role = session?.role
      if (!session) {
        throw new ForbiddenError('Unauthenticated, please login')
      }

      if (this.fallbackRole.length > 0) {
        if (role !== this.role && !this.fallbackRole.includes(String(role))) {
          throw new AuthError('You are not authorized to access this resource')
        }
      } else {
        if (role !== this.role) {
          throw new AuthError('You are not authorized to access this resource')
        }
      }

      const userInfo = await prisma.users.findMany({
        select: {
          id: true
        },
        where: {
          id: session.id
        },
        take: 1
      })

      if (userInfo.length < 1) {
        throw new BadRequestError('Invalid session, we could not find a user with this ID.')
      }

      next()
    } catch (error: any) {
      if (error instanceof BadRequestError) {
        return res.status(400).json({
          status: 'fail',
          message: error.message
        })
      }
      if (error instanceof AuthError) {
        if (this.authSide === 'view') {
          res.status(401).render('errors/not-auth', {
            title: '401',
            layout: 'plain'
          })
          return
        } else {
          return res.status(401).json({
            status: 'fail',
            message: error.message
          })
        }
      }
      if (error instanceof ForbiddenError) {
        if (this.authSide === 'view') {
          res.status(403).render('errors/forbidden', {
            title: '403',
            layout: 'plain'
          })
          return
        } else {
          return res.status(403).json({
            status: 'fail',
            message: error.message
          })
        }
      }
      return res.status(500).json({
        status: 'fail',
        message: error.message
      })
    }
  }
}

export { Auth }
