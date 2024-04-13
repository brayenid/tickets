/* eslint-disable */
const $ = (selector) => document.querySelector(selector)
const ordersEl = $('#order-list')

const detectStatus = (status) => {
  if (status === 'pending') {
    return 'yellow-badge order-badge'
  }
  if (['settlement', 'capture'].includes(status)) {
    return 'primary-badge order-badge'
  }
  if (status === 'waiting') {
    return 'blue-badge order-badge'
  }
  return 'red-badge order-badge'
}

document.addEventListener('DOMContentLoaded', async () => {
  const orders = (
    await (
      await fetch('/api/orders/detail', {
        headers: {
          'Content-Type': 'application/json'
        },
        method: 'GET'
      })
    ).json()
  ).data

  if (orders?.length > 0) {
    ordersEl.innerHTML = ''
    orders.forEach((order) => {
      ordersEl.innerHTML += `
        <a href="/user/orders/${order.id}" class="block">
        <div class="item">
            <div class="img-container">
                <img src="/uploads/events/${order.eventThumbnail}" alt="${order.eventName}">
            </div>
            <div class="main">
                <div class="item-header">
                    <p class="oid">[#${order.id}]</p>
                    <p class="${detectStatus(order.status)}">${order.status}</p>
                </div>
                <h2>${order.eventName}</h2>
                <div class="item-meta">
                    <p>Updated At : ${convertDateFormat(order.updatedAt)}</p>
                    <p>${order.items?.length} item(s) - ${order.source}</p>
                </div>
            </div>
        </div>
        </a>
        `
    })
  }
})
