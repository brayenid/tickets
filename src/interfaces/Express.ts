import type { Request } from 'express'

export interface FileRequest extends Request {
  fileId?: string
}
