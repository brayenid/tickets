/* eslint-disable */
const eventPriceFormEl = document.querySelector('#event-price')

const input = document.querySelector('#price-amount')
input.addEventListener('input', (e) => {
  e.target.value = sanitizeNonNumber(e.target.value, 'Rp')
  e.target.value = addCurrency(e.target.value)
})

eventPriceFormEl.addEventListener('submit', async (e) => {
  e.preventDefault()

  const name = eventPriceFormEl.querySelector('#price-name').value
  const amount = eventPriceFormEl.querySelector('#price-amount').value
  const stock = eventPriceFormEl.querySelector('#price-stock').value
  const grade = eventPriceFormEl.querySelector('#price-grade').value

  const payload = {
    name,
    price: removeCurrency(amount),
    grade: Number(grade),
    stock: Number(stock)
  }

  const { isConfirmed } = await Swal.fire({
    icon: 'question',
    title: 'Perbaharui Kategori Harga',
    text: 'Kamu yakin memperbaharui kategori harga baru?',
    showConfirmButton: true,
    showCancelButton: true,
    confirmButtonText: 'Ubah',
    cancelButtonText: 'Batal'
  })
  if (isConfirmed) {
    const response = await fetch(`/api/event-price/${eventPriceFormEl.dataset.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })

    const responseJson = await response.json()

    if (response.status !== 200) {
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
