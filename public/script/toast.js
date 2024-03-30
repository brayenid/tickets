/* eslint-disable */
const toastErr = (message) => {
  Toastify({
    text: `Error : ${message}`,
    duration: 3500,
    position: 'center',
    stopOnFocus: false,
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
    duration: 3500,
    position: 'center',
    stopOnFocus: false,
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

const toastWarning = (message) => {
  Toastify({
    text: `Warning : ${message}`,
    duration: 3500,
    position: 'center',
    stopOnFocus: false,
    style: {
      background: '#fefce8',
      border: '1px solid #fde047',
      borderRadius: '0.5rem',
      color: '#ca8a04',
      boxShadow: '1px 1px 4px rgba(202, 138, 4, 0.3)',
      padding: '0.4rem 0.8rem',
      fontSize: '1rem'
    }
  }).showToast()
}

const toastInfo = (message) => {
  Toastify({
    text: `Info : ${message}`,
    duration: 3500,
    position: 'center',
    stopOnFocus: false,
    style: {
      background: '#bae6fd',
      border: '1px solid #0ea5e9',
      borderRadius: '0.5rem',
      color: '#0284c7',
      boxShadow: '1px 1px 4px rgba(2, 132, 199, 0.3)',
      padding: '0.4rem 0.8rem',
      fontSize: '1rem'
    }
  }).showToast()
}
