/* eslint-disable */
const $ = (selector) => document.querySelector(selector)
const eventLoaderEl = $('#event-loader')
const searchEl = $('#search-form-event')
const searchInputEl = $('#search-input-event')
const containerTitle = $('.styled-h2')
const eventsContainer = $('#events')

let eventsArr = []

/**
 * These two length counter help to get information
 * wheter client has reached the last page
 * if they are equals, the load button will be hidden
 * that's why we put them in different values at first
 */
let oldEventArrLength = 0
let currentEventArrLength = 1

let currentPage = 1
const pageLimit = 8
let searchInput = ''

const resetCondition = () => {
  eventsArr = []
  currentPage = 1
  oldEventArrLength = 0
  currentEventArrLength = 1

  eventLoaderEl.classList.remove('hidden')
}

const loadEvents = async (search) => {
  oldEventArrLength = eventsArr.length
  const url = search
    ? `/api/events?page=${currentPage}&limit=${pageLimit}&search=${search}`
    : `/api/events?page=${currentPage}&limit=${pageLimit}`

  const events = (
    await (
      await fetch(url, {
        method: 'GET'
      })
    ).json()
  ).data

  eventsArr = [...eventsArr, ...events]
  currentEventArrLength = eventsArr.length

  eventsContainer.innerHTML = ''

  eventsArr?.forEach((item) => {
    eventsContainer.innerHTML += `
    <div class="event-item">
      <div class="img-container">
        <div class="${item?.isOpen ? 'primary-badge' : 'red-badge'} badge-position">${
      item?.isOpen ? 'Sale' : 'Close'
    }</div>
      <a href="/events/${item.id}">
          <img src="${item.thumbnail}" alt="${item.name}" loading="lazy" title="${item.name}" />
          </a>
      </div>
      <a href="/events/${item.id}">
        <h3>${item.name}</h3>
      </a>
      <p class="desc"><span class="vendor">${item.vendor}</span> - ${
      item.location
    } - ${formatISODate(item.date)}</p>
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
        <p>Start : Rp. ${addCurrencySeparator(item.lowestPrice)}</p>
      </div>
    </div>
      `
  })
}

const loadMore = async () => {
  eventLoaderLoading(true)

  currentPage++
  await loadEvents(searchInput)
  setTimeout(() => {
    eventLoaderLoading(false)
  }, 1200)

  // If reached the last event
  if (currentEventArrLength === oldEventArrLength) {
    eventLoaderEl.classList.add('hidden')
    toastInfo("You've reached the last event")
  }
}

const eventLoaderLoading = (isLoading) => {
  if (isLoading) {
    eventLoaderEl.innerHTML = `
    <svg
    aria-hidden="true"
    role="status"
    class="w-5 h-5 text-white animate-spin"
    viewBox="0 0 100 101"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
      fill="#E5E7EB"
    />
    <path
      d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
      fill="currentColor"
    />
  </svg>
    `
    eventLoaderEl.setAttribute('disabled', '')
  } else {
    eventLoaderEl.innerHTML = 'Load More'
    eventLoaderEl.removeAttribute('disabled')
  }
}

const changeContainerTitle = (view) => {
  if (view === 'search') {
    containerTitle.innerHTML = `
  <h2 class="styled-h2">
  Search
    <span class="sub">Result : </span>
  </h2>
  `
  } else {
    containerTitle.innerHTML = `
    <h2 class="styled-h2">
    Latest
      <span class="sub">Events : </span>
    </h2>
    `
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  await loadEvents()
  if (eventsArr.length < pageLimit) {
    eventLoaderEl.classList.add('hidden')
  }
})

/* Search */
searchEl.addEventListener('submit', async (e) => {
  e.preventDefault()
  resetCondition()

  searchInput = searchInputEl.value
  await loadEvents(searchInput)

  if (eventsArr?.length < 1) {
    eventLoaderEl.classList.add('hidden')

    eventsContainer.innerHTML = `
    <div class="no-event"> No event found</div>
    `
  }

  if (eventsArr?.length < pageLimit) {
    eventLoaderEl.classList.add('hidden')
  }

  changeContainerTitle('search')

  smoothScroll({ toElement: document.querySelector('#events'), paddingTop: -160 })
})
