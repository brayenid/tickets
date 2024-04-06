/* eslint-disable */
const $ = (selector) => document.querySelector(selector)
const mainFormEl = $('#main-form')

const login = async () => {
  const email = $('#main-form #email')
  const password = $('#main-form #password')

  const payload = {
    email: email.value,
    password: password.value
  }

  const response = await (
    await fetch('/api/auth', {
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload),
      method: 'POST'
    })
  ).json()

  if (response.issues) {
    response.issues?.forEach((issue) => {
      toastErr(`${issue.message} ${issue.path[0]}`)
    })
    return
  } else if (response.status === 'fail') {
    toastErr(response.message)
    return
  }

  toastSuccess(response.message)
  setTimeout(() => {
    window.location.replace('/')
  }, 1000)
}

mainFormEl.addEventListener('submit', async (e) => {
  e.preventDefault()
  await login()
})
