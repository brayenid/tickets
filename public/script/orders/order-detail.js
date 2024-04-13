/* eslint-disable */
const $ = (selector) => document.querySelector(selector)
const orderDetail = $('#order-detail')
const orderId = orderDetail.dataset.orderId

const openPayment = async () => {
  window.snap.pay(orderDetail.dataset.token, {
    onSuccess: function (result) {
      toastSuccess('Payment success!')
      setTimeout(() => {
        window.location.reload()
      }, 500)
    },
    onPending: function (result) {
      toastWarning('Waiting your payment!')
    },
    onError: function (result) {
      toastErr('Payment failed!')
    }
  })
}

const cancelPayment = async () => {
  const { isConfirmed } = await Swal.fire({
    icon: 'question',
    title: 'Batalkan Pesanan',
    text: 'Yakin membatalkan pesanan ini?',
    showCancelButton: true,
    cancelButtonText: 'Tutup',
    confirmButtonText: 'Batalkan'
  })

  if (isConfirmed) {
    const response = await fetch(`/api/order/cancel/${orderId}`, {
      headers: {
        'Content-Type': 'application/json'
      },
      method: 'POST'
    })
    const responseJson = await response.json()
    if (response.status !== 200) {
      toastErr(responseJson.message)
      return
    }

    toastSuccess(responseJson.message)
    setTimeout(() => {
      window.location.reload()
    }, 1500)
  }
}

const socket = io()
socket.on(`${orderId}:message`, (msg) => {
  if (msg.orderId === orderId) {
    window.snap.hide()
    toastErr(msg.message)
    document.querySelector('#payment-btn-container').innerHTML = ''

    setTimeout(() => {
      window.location.reload()
    }, 3000)
  }
})
