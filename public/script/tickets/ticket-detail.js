/* eslint-disable */
const ticketId = document.querySelector('#ticket-detail').dataset.txId
new QRCode(document.getElementById('qrcode'), ticketId)
