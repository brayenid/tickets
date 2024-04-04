/* eslint-disable */
const logOut = async () => {
  const response = await (
    await fetch('/api/auth', {
      method: 'DELETE'
    })
  ).json()

  if (response.status === 'fail') {
    toastErr(response.message)
    return
  }
  toastSuccess(response.message)
  setTimeout(() => {
    window.location.replace('/login')
  }, 1000)
}

const addCurrencySeparator = (number) => {
  const numString = number.toString()
  const parts = numString.split('.')
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  const formattedNumber = parts.join('.')

  return formattedNumber
}

const convertDateFormat = (dateISO) => {
  const date = new Date(dateISO)
  const year = date.getFullYear().toString().substr(-2) // Get last 2 digits of the year
  const month = ('0' + (date.getMonth() + 1)).slice(-2) // Add '0' in front if month is single digit
  const day = ('0' + date.getDate()).slice(-2) // Add '0' in front if day is single digit
  const hours = ('0' + date.getHours()).slice(-2) // Add '0' in front if hours is single digit
  const minutes = ('0' + date.getMinutes()).slice(-2) // Add '0' in front if minutes is single digit

  return `${day}/${month}/${year}-${hours}:${minutes}`
}

const formatDate = (inputDate) => {
  const parts = inputDate.split('-')
  const year = parts[0]
  const month = parts[1]
  const day = parts[2]
  const formattedDate = `${day}/${month}/${year}`
  return formattedDate
}

// Define the function to format ISO date to the desired format
const formatISODate = (isoDateString) => {
  // Create a Date object from the ISO string
  const date = new Date(isoDateString)

  // Function to add leading zero to single digit numbers
  const addLeadingZero = (number) => (number < 10 ? '0' + number : number)

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

const addCurrency = (number, currency) => {
  const processed = number
    .split('.')
    .join('')
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  if (currency) {
    return `${currency}. ${processed}`
  }
  return processed
}

const removeCurrency = (number) => {
  return parseFloat(number.toString().replace(/\./g, ''))
}
const sanitizeNonNumber = (value) => {
  return value.replace(/[^0-9.]/g, '')
}

// window.addEventListener('load', () => {
//   if ('serviceWorker' in navigator) {
//     navigator.serviceWorker.register('/sw.js')
//   }
// })
