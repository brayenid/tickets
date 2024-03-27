/* eslint-disable */
const $ = (selector) => document.querySelector(selector)

const mainFormEl = $('#main-form')
const verificationFormEl = $('#verification-form')
const verificationFormInputEl = verificationFormEl.querySelector('input')
const verificationFormButtonEl = verificationFormEl.querySelector('button')
const verificationTokenEl = $('#verification-token')

const elementVisibility = (act, element) => {
  const el = $(element)
  if (act === 'show') {
    el?.classList.remove('hidden')
  } else if (act === 'hide') {
    el?.classList.add('hidden')
  }
}

let settedEmail = ''
let settledRegisterId = ''

/* VERIFY PASSWORD */
const verifyPassword = (password, passwordConf) => {
  return password === passwordConf
}

/**
 * Will send email obtained from email input value, this will
 * set settledEmail var
 */
const sendVerification = async () => {
  const email = $('#email')
  /* DISABLE EMAIL AND BUTTON */
  verificationFormInputEl.setAttribute('disabled', '')
  verificationFormButtonEl.setAttribute('disabled', '')

  const response = await (
    await fetch('/api/register/verification', {
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: email.value
      }),
      method: 'POST'
    })
  ).json()

  if (response.issues) {
    response.issues?.forEach((issue) => {
      toastErr(issue.message)
    })
    verificationFormInputEl.removeAttribute('disabled', '')
    verificationFormButtonEl.removeAttribute('disabled', '')
    return
  } else if (response.status === 'fail') {
    toastErr(response.message)
    verificationFormInputEl.removeAttribute('disabled', '')
    verificationFormButtonEl.removeAttribute('disabled', '')
    return
  }

  /* HIDE EMAIL VERIFICATION BUTTON AND SHOW VERIFICATION TOKEN FORM */
  elementVisibility('hide', '#verification-form button')
  elementVisibility('show', '#verification-token')

  /* HIGHLIGHT TOKEN INPUT */
  $('#token').focus()

  toastSuccess(response.message)
  settedEmail = email.value
}

/**
 * Will send email and token, this will set settledRegisterId
 */
const verifyToken = async () => {
  const tokenEl = verificationTokenEl.querySelector('#token')
  const response = await (
    await fetch('/api/register/verification/token', {
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: settedEmail,
        token: tokenEl.value
      }),
      method: 'POST'
    })
  ).json()

  if (response.issues) {
    response.issues?.forEach((issue) => {
      toastErr(issue.message)
    })
    return
  } else if (response.status === 'fail') {
    toastErr(response.message)
    return
  }
  /* HIDE VERIFICATION TOKEN FORM AND SHOW MAIN FORM */
  elementVisibility('hide', '#verification-token')
  elementVisibility('show', '#main-form')

  toastSuccess(response.message)
  settledRegisterId = response.data
}

/**
 * Final process of registration
 * Will send name, email, address, password, birthdate, gender
 * registerId needed
 */
const register = async () => {
  const name = $('#main-form #name')
  const birthdate = $('#main-form #birthdate')
  const address = $('#main-form #address')
  const gender = $('#main-form #gender')
  const password = $('#main-form #password')
  const passwordConf = $('#main-form #confirm-password')

  const payload = {
    name: name.value,
    email: settedEmail,
    birth: birthdate.value,
    address: address.value,
    gender: gender.value,
    password: password.value,
    registerId: settledRegisterId
  }

  const isPasswordMatched = verifyPassword(password.value, passwordConf.value)
  if (!isPasswordMatched) {
    toastErr('Password and Confirmation Password are not matched')
    return
  }

  const response = await (
    await fetch('/api/customers', {
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

  toastSuccess('Account created successfully')
  setTimeout(() => {
    window.location.reload()
  }, 2000)
}

mainFormEl.addEventListener('submit', async (e) => {
  e.preventDefault()
  await register()
})
