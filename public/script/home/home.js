/* eslint-disable */
const $ = (selector) => document.querySelector(selector)

const formatDate = (inputDate) => {
  const parts = inputDate.split('-')
  const year = parts[0]
  const month = parts[1]
  const day = parts[2]
  const formattedDate = `${day}/${month}/${year}`
  return formattedDate
}

document.addEventListener('DOMContentLoaded', async () => {
  const events = (
    await (
      await fetch('/api/events?page=1', {
        method: 'GET'
      })
    ).json()
  ).data

  const eventsContainer = $('#events')
  eventsContainer.innerHTML = ''

  for (let i = 0; i < events.length; i++) {
    const item = events[i]
    eventsContainer.innerHTML += `
    <a href="/events/${item.id}">
      <div class="event-item">
        <div class="img-container">
          <div class="${item?.isOpen ? 'primary-badge' : 'red-badge'} badge-position">${
      item?.isOpen ? 'Sale' : 'Close'
    }</div>
          <img src="${item.thumbnail}" alt="${item.name}" loading="lazy" title="${item.name}" />
        </div>
        <h3>${item.name}</h3>
        <p class="desc"><span class="vendor">${item.vendor}</span> - ${
      item.location
    } - ${formatDate(item.date)}</p>
        <hr />
        <div class="price-tag">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="m17.967 6.558l-1.83-1.83c-1.546-1.545-2.318-2.318-3.321-2.605c-1.003-.288-2.068-.042-4.197.45l-1.228.283c-1.792.413-2.688.62-3.302 1.233c-.613.614-.82 1.51-1.233 3.302l-.284 1.228c-.491 2.13-.737 3.194-.45 4.197c.288 1.003 1.061 1.775 2.606 3.32l1.83 1.83C9.248 20.657 10.592 22 12.262 22c1.671 0 3.015-1.344 5.704-4.033c2.69-2.69 4.034-4.034 4.034-5.705c0-1.67-1.344-3.015-4.033-5.704"
              opacity=".5"
            />
            <path
              fill="currentColor"
              d="M11.147 14.328c-.673-.672-.667-1.638-.265-2.403a.75.75 0 0 1 1.04-1.046c.34-.18.713-.276 1.085-.272a.75.75 0 0 1-.014 1.5a.88.88 0 0 0-.609.277c-.387.387-.285.775-.177.884c.11.109.497.21.884-.177c.784-.784 2.138-1.044 3.006-.177c.673.673.667 1.639.264 2.404a.75.75 0 0 1-1.04 1.045a2.201 2.201 0 0 1-1.472.232a.75.75 0 1 1 .302-1.47c.177.037.463-.021.708-.266c.388-.388.286-.775.177-.884c-.109-.109-.496-.21-.884.177c-.784.784-2.138 1.044-3.005.176m-1.126-4.035a2 2 0 1 0-2.828-2.828a2 2 0 0 0 2.828 2.828"
            />
          </svg>
          <p>RP. 125.000</p>
        </div>
      </div>
    </a>
      `
  }
})
