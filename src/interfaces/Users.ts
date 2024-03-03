export interface User {
  name: string
  username: string
  password: string
}

export interface UserRequestBody extends User {
  id: string
}
