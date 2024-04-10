/* eslint-disable */
const $ = (selector) => document.querySelector(selector)
const resetPasswordForm = $('#reset-password-form')
const submitBtn = $('#reset-password-form button[type="submit"]')

new SuggestionBox({
  inputElement: '#user-id',
  element: '#customer-suggestion',
  apiGet: '/api/users'
})

resetPasswordForm.addEventListener('submit', async (e) => {
  e.preventDefault()

  const userId = $('#reset-password-form #user-id').value
  const password = $('#reset-password-form #password').value
  const confPassword = $('#reset-password-form #conf-password').value

  if (password !== confPassword) {
    toastErr('Password baru dan konfirmasi password tidak sama')
    return
  }

  submitBtn.setAttribute('disabled', '')

  const { isConfirmed } = await Swal.fire({
    icon: 'question',
    title: 'Reset Password',
    text: 'Yakin mereset password akun ini?',
    showCancelButton: true,
    cancelButtonText: 'Batal',
    confirmButtonText: 'Reset'
  })

  if (isConfirmed) {
    const response = await fetch('/api/credential/reset', {
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        id: userId,
        password
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
  }

  submitBtn.removeAttribute('disabled')
})
