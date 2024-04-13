/* eslint-disable */
const $ = (selector) => document.querySelector(selector)
const mainFormEl = $('#forget-form')
const submitBtn = mainFormEl.querySelector('button[type="submit"]')

const forgetRequest = async () => {
  const email = $('#forget-form #email')

  const payload = {
    email: email.value
  }

  submitBtn.setAttribute('disabled', '')

  const response = await (
    await fetch('/api/credential/forget', {
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload),
      method: 'POST'
    })
  ).json()

  submitBtn.remove('disabled', '')

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
}

mainFormEl.addEventListener('submit', async (e) => {
  e.preventDefault()
  await forgetRequest()
})
