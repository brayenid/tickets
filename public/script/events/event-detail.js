/* eslint-disable */
const $ = (selector) => document.querySelector(selector)
const qtyCounters = document.querySelectorAll('.qty-counter')
const tickets = document.querySelectorAll('.ticket')
const qtyCounterBtns = document.querySelectorAll('.qty-operation-btn')
const checkoutButton = $('.checkout')
const totalPriceEl = $('#total-price .price')
const ticketsEl = $('.tickets')
const floatingSidebarMain = $('#floating-drawer .main')

let accumulateQty = 0 // To ensure no fetch committed if there is 0 qty
let total = 0
const mobileSize = 768

let originalParent

const getBrowserWindowSize = () => {
  const width =
    window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth
  return width
}

const moveElementBasedOnWindowSize = () => {
  if (getBrowserWindowSize() < mobileSize) {
    floatingSidebarMain.appendChild(ticketsEl)
  } else {
    if (originalParent) {
      originalParent.appendChild(ticketsEl)
    }
  }
}

window.addEventListener('resize', moveElementBasedOnWindowSize)

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
    toastErr('Harus beli minimal 1 tiket')
    return
  }

  payload.eventId = $('#event-detail').dataset.event

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
    setTimeout(() => {
      window.location.replace(`/user/orders/${responseJson.data.id}`)
    }, 500)
  }
}

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

/* Adjusting footer margin, bc the buy button covered it up */
document.querySelector('#footer').classList.add('pb-footer')

/* Share buttons */
const currentPath = window.location.href
const fbUrl = `https://www.facebook.com/sharer.php?u=${currentPath}`
const twitterUrl = `https://twitter.com/intent/tweet?url=${currentPath}`
const waUrl = `https://api.whatsapp.com/send?text=${currentPath}`

const shareContainer = document.querySelector('.share')
const fb = shareContainer.querySelector('.facebook')
const tw = shareContainer.querySelector('.twitter')
const wa = shareContainer.querySelector('.whatsapp')

document.addEventListener('DOMContentLoaded', () => {
  // Save preference to the origin parent element
  originalParent = ticketsEl.parentNode
  moveElementBasedOnWindowSize()

  fb.setAttribute('href', fbUrl)
  tw.setAttribute('href', twitterUrl)
  wa.setAttribute('href', waUrl)
})
