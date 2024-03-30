/* eslint-disable */
const $ = (selector) => document.querySelector(selector)
const ticketsEl = $('#ticket-list')

const detectStatus = (status) => {
  if (!status) {
    return 'primary-badge order-badge'
  } else {
    return 'yellow-badge order-badge'
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  const tickets = (
    await (
      await fetch('/api/tickets/user', {
        method: 'GET'
      })
    ).json()
  ).data

  if (tickets?.length > 0) {
    ticketsEl.innerHTML = ''
    tickets.forEach((ticket) => {
      ticketsEl.innerHTML += `
        <a href="/user/tickets/${ticket.id}" class="block">
          <div class="item">
          <div class="img-container">
            <img src="/${ticket.event.thumbnail}" alt="${ticket.event.name}">
          </div>
            <div class="main">
              <div class="item-header">
              <p class="txid">${ticket.id}</p>
                <p class="status ${detectStatus(ticket.isActive)}">${
        ticket.isActive ? 'Redeemed' : 'Available'
      }</p>
              </div>
              <h2 class="truncate">${ticket.event.name} - ${ticket.category}</h2>
              <div class="item-meta">
                <p>Held on : ${formatDate(ticket.event.date)}</p>
              </div>
            </div>
        </div>
        </a>
        `
    })
  }
})
