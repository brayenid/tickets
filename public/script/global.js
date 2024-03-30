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

// window.addEventListener('load', () => {
//   if ('serviceWorker' in navigator) {
//     navigator.serviceWorker.register('/sw.js')
//   }
// })
