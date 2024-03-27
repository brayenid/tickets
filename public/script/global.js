/* eslint-disable */
const logOut = async () => {
  const response = await (
    await fetch('/api/auth', {
      method: 'DELETE'
    })
  ).json()

  if (response.status === 'fail') {
    toastErr(response.message)
    return
  }
  toastSuccess(response.message)
  setTimeout(() => {
    window.location.replace('/login')
  }, 1000)
}
