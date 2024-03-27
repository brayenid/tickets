/* eslint-disable */
const toastErr = (message) => {
  Toastify({
    text: `Error : ${message}`,
    duration: 5000,
    style: {
      background: '#fee2e2',
      border: '1px solid #f87171',
      borderRadius: '0.5rem',
      color: '#ef4444',
      boxShadow: '1px 1px 4px rgba(239, 68, 68, 0.3)',
      padding: '0.4rem 0.8rem',
      fontSize: '1rem'
    }
  }).showToast()
}

const toastSuccess = (message) => {
  Toastify({
    text: `Success : ${message}`,
    duration: 5000,
    style: {
      background: '#f0fdfa',
      border: '1px solid #5eead4',
      borderRadius: '0.5rem',
      color: '#0f766e',
      boxShadow: '1px 1px 4px rgba(94, 234, 212, 0.3)',
      padding: '0.4rem 0.8rem',
      fontSize: '1rem'
    }
  }).showToast()
}
