export const formatDate = (inputDate: string): string => {
  const parts = inputDate.split('-')

  const year = parts[0]
  const month = parts[1]
  const day = parts[2]

  const formattedDate = `${day}/${month}/${year}`
  return formattedDate
}

export const formatISODate = (isoDateString: string): string => {
  // Create a Date object from the ISO string
  const date = new Date(isoDateString)

  // Function to add leading zero to single digit numbers
  const addLeadingZero = (number: number): string | number => (number < 10 ? '0' + number : number)

  // Extract day, month, year, hours, and minutes from the Date object
  const day = addLeadingZero(date.getDate())
  const month = addLeadingZero(date.getMonth() + 1)
  const year = addLeadingZero(date.getFullYear() % 100) // Get the last two digits of the year
  const hours = addLeadingZero(date.getHours())
  const minutes = addLeadingZero(date.getMinutes())

  // Format the date in the desired format
  const formattedDate = `${day}/${month}/${year} - ${hours}:${minutes}`

  // Return the formatted date
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

// Specific for role comparation
export const isEqual = (role: string, permittedRole: string, block: any): any => {
  const permittedRoleArr = permittedRole.split(',')

  if (permittedRoleArr.includes(role)) {
    return block.fn(this)
  } else {
    return block.inverse(this)
  }
}

export const moreThanZero = (input: number | string, block: any): any => {
  if (Number(input) !== 0) {
    return block.fn(this)
  } else {
    return block.inverse(this)
  }
}

export const ifEqualNumber = (base: number | string, compare: number | string, block: any): any => {
  if (Number(base) === Number(compare)) {
    return block.fn(this)
  }
  return block.inverse(this)
}

// For comparing selected value in select input
export const isSelected = (value: any, selectedValue: any, block: any): any => {
  if (value === selectedValue) {
    return block.fn(this)
  }
  return block.inverse(this)
}
