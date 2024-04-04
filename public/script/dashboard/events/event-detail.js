/* eslint-disable */
const quill = new Quill('#editor', {
  modules: {
    toolbar: true
  },
  placeholder: 'Write event decription...',
  theme: 'snow'
})

const eventDetailForm = document.querySelector('#create-event')

document.addEventListener('DOMContentLoaded', async () => {
  const response = await (
    await fetch(`/api/events/detail/${eventDetailForm.dataset.eventId}`, {
      method: 'GET'
    })
  ).json()

  quill.root.innerHTML = response.data.description
})

const eventUpdateBtn = document.querySelector('#event-update-btn')
const eventUpdateLoading = (isLoading) => {
  if (isLoading) {
    eventUpdateBtn.innerHTML = `
    <svg
    aria-hidden="true"
    role="status"
    class="w-5 h-5 text-white animate-spin"
    viewBox="0 0 100 101"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
      fill="#E5E7EB"
    />
    <path
      d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
      fill="currentColor"
    />
  </svg>
    `
    eventUpdateBtn.setAttribute('disabled', '')
  } else {
    eventUpdateBtn.innerHTML = 'Update Event'
    eventUpdateBtn.removeAttribute('disabled')
  }
}

const $ = (selector) => document.querySelector(selector)

const updateEvent = async () => {
  const eventName = $('#event-name').value
  const isOpen = $('#is-open').value
  const eventLocation = $('#event-location').value
  const eventDate = $('#event-date').value
  const eventVendor = $('#vendor-id').value
  const eventThumbnail = document.querySelector('#event-thumbnail')
  const eventDesc = quill.root.innerHTML

  const formData = new FormData()
  formData.append('name', eventName)
  formData.append('isOpen', isOpen)
  formData.append('location', eventLocation)
  formData.append('date', eventDate)
  formData.append('vendorId', eventVendor)
  formData.append('description', eventDesc)

  const isWithFile = eventThumbnail.files.length > 0

  if (isWithFile) {
    formData.append('eventThumbnail', eventThumbnail.files[0])
  }

  const { isConfirmed } = await Swal.fire({
    icon: 'question',
    title: 'Update Event',
    text: isWithFile
      ? 'Are you sure to update the event and upload new thumbnail?'
      : 'Are you sure to update the event?',
    showConfirmButton: true,
    showCancelButton: true,
    confirmButtonText: 'Update'
  })

  if (isConfirmed) {
    eventUpdateLoading(true)

    // Make abort controller instance
    const controller = new AbortController()
    const signal = controller.signal

    // Set timeout of the fetch time limit
    const timeoutId = setTimeout(() => {
      controller.abort()
      eventUpdateLoading(false)
    }, 10000)

    try {
      const response = await fetch(`/api/events/${eventDetailForm.dataset.eventId}`, {
        method: 'PUT',
        body: formData,
        signal // Include signal into fetch
      })

      clearTimeout(timeoutId)

      const responseJson = await response.json()
      if (response.status !== 200) {
        if (responseJson?.issues) {
          eventUpdateLoading(false)
          response.issues?.forEach((issue) => {
            toastErr(issue.message)
            return
          })
        }
        eventUpdateLoading(false)
        toastErr(responseJson?.message)
        return
      }

      eventUpdateLoading(false)
      toastSuccess(responseJson.message)
    } catch (error) {
      eventUpdateLoading(false)
      toastErr('Server timeout.')
    }
  }
}

eventDetailForm.addEventListener('submit', async (e) => {
  e.preventDefault()

  await updateEvent()
})

const eventPriceForm = document.querySelector('#event-price')

eventPriceForm.addEventListener('submit', async (e) => {
  e.preventDefault()

  const name = eventPriceForm.querySelector('#price-name').value
  const amount = eventPriceForm.querySelector('#price-amount').value
  const stock = eventPriceForm.querySelector('#price-stock').value
  const grade = eventPriceForm.querySelector('#price-grade').value

  const payload = {
    eventId: eventDetailForm.dataset.eventId,
    name,
    price: removeCurrency(amount),
    grade: Number(grade),
    stock: Number(stock)
  }

  const { isConfirmed } = await Swal.fire({
    icon: 'question',
    title: 'Add New Price',
    text: 'Are you sure to add new price?',
    showConfirmButton: true,
    showCancelButton: true,
    confirmButtonText: 'Add'
  })
  if (isConfirmed) {
    const response = await fetch('/api/event-price', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })

    const responseJson = await response.json()

    if (response.status !== 201) {
      if (responseJson?.issues) {
        response.issues?.forEach((issue) => {
          toastErr(issue.message)
          return
        })
      }
      toastErr(responseJson?.message)
      return
    }

    toastSuccess(responseJson.message)

    setTimeout(() => {
      window.location.reload()
    }, 1000)
  }
})

const input = document.querySelector('#price-amount')
input.addEventListener('input', (e) => {
  e.target.value = sanitizeNonNumber(e.target.value, 'Rp')
  e.target.value = addCurrency(e.target.value)
})

// Intercept ctrl+s to save update
document.addEventListener('keydown', async (e) => {
  if (e.ctrlKey && e.key === 's') {
    e.preventDefault()
    await updateEvent()
  }
})

// DANGER ZONE

const deleteEvent = async (id) => {
  const { isConfirmed } = await Swal.fire({
    icon: 'question',
    title: 'Delete Event',
    text: 'Are you sure delete this event?',
    showConfirmButton: true,
    showCancelButton: true,
    confirmButtonText: 'Delete'
  })

  if (isConfirmed) {
    const response = await fetch(`/api/events/${id}`, {
      method: 'DELETE'
    })
    const responseJson = await response.json()

    if (response.status !== 200) {
      toastErr(response.message)
      return
    }
    toastSuccess(responseJson.message)
    setTimeout(() => {
      window.location.replace('/dashboard/events')
    }, 1000)
  }
}

const deleteEventPrice = async (id) => {
  const { isConfirmed } = await Swal.fire({
    icon: 'question',
    title: 'Delete Price',
    text: 'Are you sure delete this price?',
    showConfirmButton: true,
    showCancelButton: true,
    confirmButtonText: 'Delete'
  })

  if (isConfirmed) {
    const response = await fetch(`/api/event-price/${id}`, {
      method: 'DELETE'
    })
    const responseJson = await response.json()

    if (response.status !== 200) {
      toastErr(response.message)
      return
    }
    toastSuccess(responseJson.message)
    setTimeout(() => {
      window.location.reload()
    }, 1000)
  }
}
