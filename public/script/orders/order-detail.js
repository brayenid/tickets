/* eslint-disable */
const $ = (selector) => document.querySelector(selector)

const paymentToken = $('#order-detail')

const openPayment = () => {
  window.snap.pay(paymentToken.dataset.token, {
    onSuccess: function (result) {
      toastSuccess('Payment success!')
      setTimeout(() => {
        window.location.reload()
      }, 500)
    },
    onPending: function (result) {
      /* You may add your own implementation here */
      toastWarning('Waiting your payment!')
    },
    onError: function (result) {
      /* You may add your own implementation here */
      toastErr('Payment failed!')
    },
    onClose: function () {
      /* You may add your own implementation here */
      toastWarning('You closed the popup without finishing the payment')
    }
  })
}
