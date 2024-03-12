export interface UserRequestBody {
  name: string
  email: string
  password: string
  role: string
  address?: string
  birth?: string
}

export interface User extends UserRequestBody {
  id: string
  isActive?: boolean
}

export interface Users {
  id: string
  name: string
  email: string
  role: string
  password?: string
  createdAt?: number
}

export interface UserUpdate {
  name: string
  address: string
  birth: string
}
