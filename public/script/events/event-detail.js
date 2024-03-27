/* eslint-disable */
const $ = (selector) => document.querySelector(selector)
const qtyCounters = document.querySelectorAll('.qty-counter')
const tickets = document.querySelectorAll('.ticket')
const checkoutButton = $('.checkout')

let accumulateQty = 0

const checkout = async () => {
  let payload = {
    eventId: '',
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
    toastErr('You have to buy at least 1 ticket')
    return
  }

  payload.eventId = $('#event-detail').dataset.event

  const { isConfirmed } = await Swal.fire({
    icon: 'question',
    title: 'Checkout',
    text: 'Are you sure to checkout the ticket(s)',
    showCancelButton: true,
    showConfirmButton: true,
    confirmButtonText: 'Checkout',
    padding: '1rem 0.7rem',
    customClass: {
      title: 'sw-title',
      htmlContainer: 'sw-text'
    }
  })

  if (isConfirmed) {
    const response = await fetch('/api/transaction', {
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
    console.log(responseJson)
  }
}
