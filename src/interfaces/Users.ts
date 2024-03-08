export interface UserRequestBody {
  name: string
  email: string
  password: string
  role: string
}

export interface User extends UserRequestBody {
  id: string
}

export interface Users {
  id: string
  name: string
  email: string
  role: string
  password?: string
  createdAt?: number
}
