/* eslint-disable */
const forgetPasswordFormEl = document.querySelector('#forget-password-form')
const submitBtn = forgetPasswordFormEl.querySelector('button[type="submit"]')

forgetPasswordFormEl.addEventListener('submit', async (e) => {
  e.preventDefault()

  const email = forgetPasswordFormEl.querySelector('#email').value
  const token = forgetPasswordFormEl.querySelector('#token').value
  const password = forgetPasswordFormEl.querySelector('#new-password').value
  const confPassword = forgetPasswordFormEl.querySelector('#confirm-password').value

  if (password !== confPassword) {
    toastErr('Password baru dan konfirmasi password tidak sama')
    return
  }

  submitBtn.setAttribute('disabled', '')

  const response = await fetch('/api/credential/forget', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email,
      forgetToken: token,
      password
    })
  })

  const responseJson = await response.json()

  if (response.status !== 200) {
    toastErr(responseJson.message)
    submitBtn.removeAttribute('disabled', '')
    return
  }

  toastSuccess(`${responseJson.message}, dialihkan...`)

  setTimeout(() => {
    window.location.replace('/login')
  }, 2000)
})
