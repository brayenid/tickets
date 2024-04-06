const navbarHomeEl = document.querySelector('#navbar-home')
document.addEventListener('DOMContentLoaded', () => {
  const scrollTop = document.body.scrollTop || document.documentElement.scrollTop

  let scrollPosState = 0

  if (scrollTop / 100 <= 1) {
    scrollPosState = scrollTop / 100
  } else {
    scrollPosState = 1
  }

  navbarHomeEl.style.backgroundColor = `rgba(5,80,92,${scrollPosState})`
})
document.addEventListener('scroll', () => {
  const scrollTop = document.body.scrollTop || document.documentElement.scrollTop

  let scrollPosState = 0

  if (scrollTop / 100 <= 1) {
    scrollPosState = scrollTop / 100
  } else {
    scrollPosState = 1
  }

  navbarHomeEl.style.backgroundColor = `rgba(5,80,92,${scrollPosState})`
})
