/* eslint-disable */
const $ = (selector) => document.querySelector(selector)

const orderDetail = $('#order-detail')

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
    },
    onClose: function () {
      toastWarning('You closed the popup without finishing the payment')
    },
    selectedPaymentType: 'gci'
  })
}
const socket = io()

socket.on(`${orderDetail.dataset.orderId}:message`, (msg) => {
  if (msg.orderId === orderDetail.dataset.orderId) {
    window.snap.hide()
    toastErr(msg.message)
    document.querySelector('#payment-btn-container').innerHTML = ''

    setTimeout(() => {
      window.location.reload()
    }, 3000)
  }
})
