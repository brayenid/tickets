/* eslint-disable */
const createVendorFormEl = document.querySelector('#create-vendor')

const setOfflineCapability = async () => {
  const { isConfirmed } = await Swal.fire({
    icon: 'question',
    title: 'Kapabilitas Penjualan Offline',
    text: 'Yakin memperbaharui status kapabilitas?',
    showCancelButton: true,
    confirmButtonText: 'Ubah',
    cancelButtonText: 'Batal'
  })

  if (isConfirmed) {
    const response = await fetch(
      `/api/accounts/offline-capability?vendorId=${createVendorFormEl.dataset.id}`,
      {
        method: 'POST'
      }
    )

    const responseJson = await response.json()

    if (response.status !== 200) {
      toastErr(responseJson.message)
      return
    }

    toastSuccess(responseJson.message)

    setTimeout(() => {
      window.location.reload()
    }, 1200)
  }
}
