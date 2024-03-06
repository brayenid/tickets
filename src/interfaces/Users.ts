export interface UserRequestBody {
  name: string
  username: string
  password: string
  role: string
}

export interface User extends UserRequestBody {
  id: string
}

export interface Users {
  id: string
  name: string
  username: string
  role: string
  password?: string
  createdAt?: number
}
