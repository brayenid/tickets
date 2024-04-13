/* eslint-disable */

new SuggestionBox({
  inputElement: '#event-id-search',
  element: '#event-suggestion',
  apiGet: '/api/vendor/events'
})

new SuggestionBox({
  inputElement: '#user-id',
  element: '#customer-suggestion',
  apiGet: '/api/users'
})

// TICKET BUY
const $ = (selector) => document.querySelector(selector)
const qtyCounters = document.querySelectorAll('.qty-counter')
const tickets = document.querySelectorAll('.ticket')
const qtyCounterBtns = document.querySelectorAll('.qty-operation-btn')
const checkoutButton = $('.checkout')
const totalPriceEl = $('#total-price .price')
const ticketsEl = $('.tickets')

// Input
const eventId = $('#event-id-search')
const userId = $('#user-id')

let accumulateQty = 0 // To ensure no fetch committed if there is 0 qty
let total = 0

const isReachedBookLimit = () => accumulateQty > 4
qtyCounterBtns.forEach((button) => {
  button.addEventListener('click', () => {
    const qtyInputEl = $(`#qty-input-${button.dataset.input}`)
    const qty = Number(qtyInputEl.value)

    if (button.dataset.btn === 'inc') {
      if (qty < 5 && !isReachedBookLimit()) {
        qtyInputEl.value = qty + 1
        accumulateQty++
      }
    } else if (button.dataset.btn === 'dec') {
      if (qty > 0) {
        qtyInputEl.value = qty - 1
        accumulateQty--
      }
    }

    document.dispatchEvent(new Event('qty-changed'))
  })
})

document.addEventListener('qty-changed', () => {
  const arrPrice = []
  tickets.forEach((ticket) => {
    const qtyInputEl = $(`#qty-input-${ticket.dataset.priceId}`)
    const price = ticket.dataset.price

    arrPrice.push(Number(qtyInputEl.value) * Number(price))
  })
  total = arrPrice.reduce((a, b) => {
    return a + b
  })

  totalPriceEl.textContent = addCurrencySeparator(total)
})

const checkout = async () => {
  const payload = {
    eventId: eventId.value,
    userId: userId.value,
    items: []
  }
  accumulateQty = 0
  tickets.forEach((ticket) => {
    const qtyInputEl = $(`#qty-input-${ticket.dataset.priceId}`)
    const data = {
      eventPriceId: ticket.dataset.priceId,
      quantity: Number(qtyInputEl.value)
    }

    accumulateQty += Number(qtyInputEl.value)
    if (data.quantity > 0) {
      payload.items.push(data)
    }
  })

  if (accumulateQty < 1) {
    toastErr('Harus beli minimal 1 tiket')
    return
  }

  const { isConfirmed } = await Swal.fire({
    icon: 'question',
    title: 'Selesaikan',
    text: 'Yakin melakukan pembelian tiket?',
    showCancelButton: true,
    showConfirmButton: true,
    confirmButtonText: 'Bayar',
    cancelButtonText: 'Batal',
    padding: '1rem 0.7rem',
    customClass: {
      title: 'sw-title',
      htmlContainer: 'sw-text'
    }
  })

  if (isConfirmed) {
    const response = await fetch('/api/vendor/transaction/offline', {
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload),
      method: 'POST'
    })

    const responseJson = await response.json()

    if (responseJson.status === 'fail') {
      toastErr(responseJson.message)
      return
    }

    toastSuccess(responseJson.message)
    setTimeout(() => {
      window.location.replace('/vendor/dashboard/offline-sale')
    }, 1000)
  }
}
