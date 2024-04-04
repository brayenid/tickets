/* eslint-disable */
const quill = new Quill('#editor', {
  modules: {
    toolbar: true
  },
  placeholder: 'Write event decription...',
  theme: 'snow'
})

const $ = (selector) => document.querySelector(selector)
const createEventForm = $('#create-event')

const addEventBtn = document.querySelector('#add-event-btn')
const addEventLoading = (isLoading) => {
  if (isLoading) {
    addEventBtn.innerHTML = `
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
    addEventBtn.setAttribute('disabled', '')
  } else {
    addEventBtn.innerHTML = 'Add Event'
    addEventBtn.removeAttribute('disabled')
  }
}

const addEvent = async () => {
  const eventName = $('#event-name').value
  const eventLocation = $('#event-location').value
  const eventDate = $('#event-date').value
  const eventVendor = $('#vendor-id').value
  const eventThumbnail = document.querySelector('#event-thumbnail').files[0]
  const eventDesc = quill.root.innerHTML
  const formData = new FormData()

  formData.append('name', eventName)
  formData.append('location', eventLocation)
  formData.append('date', eventDate)
  formData.append('vendorId', eventVendor)
  formData.append('eventThumbnail', eventThumbnail)
  formData.append('description', eventDesc)
  const { isConfirmed } = await Swal.fire({
    icon: 'question',
    title: 'Add New Event',
    text: 'Are you sure to add new event?',
    showConfirmButton: true,
    showCancelButton: true,
    confirmButtonText: 'Add'
  })
  if (isConfirmed) {
    addEventLoading(true)

    const controller = new AbortController()
    const signal = controller.signal

    const timeoutId = setTimeout(() => {
      controller.abort() // Membatalkan fetch jika waktu sudah melewati batas
      addEventLoading(false)
    }, 10000) // 10 detik

    try {
      const response = await fetch('/api/events', {
        method: 'POST',
        body: formData,
        signal
      })

      clearTimeout(timeoutId) // Membersihkan timeout jika fetch selesai dalam waktu yang diberikan

      const responseJson = await response.json()

      if (response.status !== 201) {
        addEventLoading(false)

        if (responseJson?.issues?.length > 0) {
          for (const issue of responseJson?.issues) {
            toastErr(`${issue.message}_${issue.path[0]}`)
          }

          return
        }
        toastErr(responseJson?.message)
        return
      }

      toastSuccess(responseJson.message)
      setTimeout(() => {
        window.location.reload()
      }, 1000)
    } catch (error) {
      addEventLoading(false)
      toastErr('Server timeout.')
    }
  }
}

createEventForm.addEventListener('submit', async (e) => {
  e.preventDefault()

  await addEvent()
})
