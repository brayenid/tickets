export const formatDate = (inputDate: string): string => {
  const parts = inputDate.split('-')

  const year = parts[0]
  const month = parts[1]
  const day = parts[2]

  const formattedDate = `${day}/${month}/${year}`
  return formattedDate
}

export const loopTimes = (n: number, block: any): string => {
  /**
   * n represents argument that we passed
   * in the template, and block in elemen inside it
   */
  let accum = ''

  /**
   * block.fn() will be filled with element inside it
   * params in .fn() will be passed to the template
   * and can be accessed by using {{this}}
   */
  for (let i = 0; i < n; ++i) {
    accum += block.fn(i)
  }

  /**
   * return accum will return a string that filled with
   * html elements
   */
  return accum
}

export const addCurrencySeparator = (number: number): string => {
  const numString = number.toString()
  const parts = numString.split('.')
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  const formattedNumber = parts.join('.')

  return formattedNumber
}

export const isEqual = (role: string, permittedRole: string, block: any): any => {
  const permittedRoleArr = permittedRole.split(',')

  if (permittedRoleArr.includes(role)) {
    return block.fn(this)
  } else {
    return block.inverse(this)
  }
}
