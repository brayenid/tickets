/* eslint-disable */
const ticketIdInput = document.querySelector('#ticket-id')
const html5QrCode = new Html5Qrcode('reader')
let isScannerOpen = false

const inputValueByScanner = (value) => {
  ticketIdInput.value = value
}

const successScan = async (decodedText, decodedResult) => {
  inputValueByScanner(decodedText)
  await html5QrCode.stop()
  isScannerOpen = false
  await activeTicket()
}

const cameraModeRear = { facingMode: 'environment' } // Will use rear cams
const scanOpt = {
  fps: 1,
  qrbox: { width: 250, height: 250 }
}

const startScanByCam = async () => {
  try {
    if (!isScannerOpen) {
      // This method will trigger user permissions
      await Html5Qrcode.getCameras()

      isScannerOpen = true
      await html5QrCode.start(cameraModeRear, scanOpt, successScan)
    } else {
      await html5QrCode.stop()
      isScannerOpen = false
    }
  } catch (err) {
    toastErr(err)
  }
}

// EVENT ID INPUT
let isEventIdInputLocked = false
const eventIdInput = document.querySelector('#event-id')

const lockEventIdInput = () => {
  if (!isEventIdInputLocked) {
    eventIdInput.setAttribute('disabled', '')
    eventIdInput.classList.add('locked')
    isEventIdInputLocked = true
  } else {
    eventIdInput.removeAttribute('disabled', '')
    eventIdInput.classList.remove('locked')
    isEventIdInputLocked = false
  }
}

new SuggestionBox({
  inputElement: '#event-id',
  element: '#event-suggestion',
  apiGet: '/api/vendor/events'
})

const ticketsTableBodyEl = document.querySelector('#ticket-list-activation')
const loadLatestTicketData = async () => {
  const latestEventIdInput = document.querySelector('#event-id').value
  if (!latestEventIdInput) {
    toastErr('Masukan Event ID')
    return
  }

  const tickets = (
    await (
      await fetch(`/api/tickets/active?eventId=${latestEventIdInput}`, {
        method: 'GET'
      })
    ).json()
  ).data
  let element = ''
  ticketsTableBodyEl.innerHTML = ''

  if (tickets.length > 0) {
    tickets.forEach((tix) => {
      element += `
      <tr class="border-b dark:border-gray-700">
        <td class="px-4 py-3">${tix.id}</td>
        <td class="px-4 py-3">${tix.category}</td>
        <td class="px-4 py-3">${tix.user}</td>
        <td class="px-4 py-3">${tix.event.name}</td>
        <td class="px-4 py-3">${formatISODate(tix.updatedAt)}</td>
      </tr>
      `
    })
  } else {
    element = `
    <tr class="border-b dark:border-gray-700">
      <td class="px-4 py-3 text-center" colspan="100%">No Data!</td>
    </tr>
    `
  }

  ticketsTableBodyEl.innerHTML = element
}

const activeTicket = async () => {
  const ticketId = document.querySelector('#ticket-id').value
  const eventId = document.querySelector('#event-id').value

  const response = await fetch('/api/tickets/activation', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      ticketId,
      eventId
    })
  })

  const responseJson = await response.json()

  if (responseJson.issues) {
    responseJson.issues?.forEach((issue) => {
      toastErr(`${issue.message} ${issue.path[0]}`)
    })
    return
  } else if (responseJson.status === 'fail') {
    toastErr(responseJson.message)
    return
  }

  toastSuccess(responseJson.message)
  await loadLatestTicketData()

  resetState()
}

const resetState = () => {
  ticketIdInput.value = ''
}

document.querySelector('#ticket-activation').addEventListener('submit', async (e) => {
  e.preventDefault()

  await activeTicket()
})
