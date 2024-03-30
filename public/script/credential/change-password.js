/* eslint-disable */
const $ = (selector) => document.querySelector(selector)
const changePasswordForm = $('#change-password-form')
const submitBtn = $('#change-password-form button[type="submit"]')

changePasswordForm.addEventListener('submit', async (e) => {
  e.preventDefault()

  const oldPassword = $('#change-password-form #old-password').value
  const newPassword = $('#change-password-form #new-password').value
  const confirmPassword = $('#change-password-form #confirm-password').value

  if (newPassword !== confirmPassword) {
    toastErr('New password and confirm new password do not match')
    return
  }

  submitBtn.setAttribute('disabled', '')

  const response = await fetch('/api/credential', {
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      oldPassword,
      newPassword
    }),
    method: 'PATCH'
  })

  const responseJson = await response.json()

  if (response.status !== 200) {
    toastErr(responseJson.message)
    submitBtn.removeAttribute('disabled')

    return
  }

  toastSuccess(responseJson.message)
  setTimeout(() => {
    window.location.reload()
  }, 1000)
})
