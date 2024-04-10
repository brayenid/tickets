/* eslint-disable */
document.addEventListener('DOMContentLoaded', async () => {
  const eventId = document.querySelector('#summary').dataset.eventId

  // PIE ATTENDERS
  const attendersByGender = (
    await (
      await fetch(`/api/statistic/events/attenders/${eventId}/gender`, {
        method: 'GET'
      })
    ).json()
  ).data

  const gender = attendersByGender.map((att) => {
    return att.gender
  })
  const genderFreq = attendersByGender.map((att) => {
    return att.freq
  })

  const pieAttendersGender = {
    series: genderFreq,
    colors: ['#F05252', '#6875F5', '#9061F9'],
    chart: {
      width: '100%',
      type: 'pie'
    },
    stroke: {
      colors: ['white'],
      lineCap: ''
    },
    plotOptions: {
      pie: {
        labels: {
          show: true
        },
        size: '100%',
        dataLabels: {
          offset: -25
        }
      }
    },
    labels: gender,
    dataLabels: {
      enabled: true,
      style: {
        fontFamily: 'Inter, sans-serif'
      }
    },
    legend: {
      position: 'bottom',
      fontFamily: 'Inter, sans-serif'
    }
  }
  if (document.getElementById('pie-chart-attenders-gender')) {
    const chart = new ApexCharts(
      document.getElementById('pie-chart-attenders-gender'),
      pieAttendersGender
    )
    chart.render()
  }

  // PIE ORDERS SOURCE
  const ordersBySource = (
    await (
      await fetch(`/api/statistic/orders/source?eventId=${eventId}`, {
        method: 'GET'
      })
    ).json()
  ).data

  const source = ordersBySource.map((src) => {
    return src.source
  })
  const souceFreq = ordersBySource.map((src) => {
    return src.freq
  })

  const pieOrdersSource = {
    series: souceFreq,
    colors: [
      '#6A5ACD', // Slate Blue
      '#FF8C69', // Salmon
      '#32CD32', // Lime Green
      '#8B4513', // Saddle Brown
      '#FFA07A', // Light Salmon
      '#FFD700', // Gold
      '#9370DB', // Medium Purple
      '#FF1493', // Deep Pink
      '#F08080', // Light Coral
      '#1E90FF' // Dodger Blue
    ],
    chart: {
      width: '100%',
      type: 'pie'
    },
    stroke: {
      colors: ['white'],
      lineCap: ''
    },
    plotOptions: {
      pie: {
        labels: {
          show: true
        },
        size: '100%',
        dataLabels: {
          offset: -25
        }
      }
    },
    labels: source,
    dataLabels: {
      enabled: true,
      style: {
        fontFamily: 'Inter, sans-serif'
      }
    },
    legend: {
      position: 'bottom',
      fontFamily: 'Inter, sans-serif'
    }
  }
  if (document.getElementById('pie-chart-orders-source')) {
    const chart = new ApexCharts(
      document.getElementById('pie-chart-orders-source'),
      pieOrdersSource
    )
    chart.render()
  }

  // PIE TICKETS
  const ticketsCat = (
    await (
      await fetch(`/api/statistic/tickets/${eventId}/category`, {
        method: 'GET'
      })
    ).json()
  ).data
  const category = ticketsCat.map((tix) => {
    return tix.category
  })
  const categoryFreq = ticketsCat.map((tix) => {
    return tix.freq
  })
  const pieTickets = {
    series: categoryFreq,
    colors: ['#1C64F2', '#16BDCA', '#FDBA8C', '#E74694'],
    chart: {
      width: '100%',
      type: 'donut'
    },
    stroke: {
      colors: ['transparent'],
      lineCap: ''
    },
    plotOptions: {
      pie: {
        donut: {
          labels: {
            show: true,
            name: {
              show: true,
              fontFamily: 'Inter, sans-serif',
              offsetY: 20
            },
            total: {
              showAlways: true,
              show: true,
              label: 'Total',
              fontFamily: 'Inter, sans-serif',
              formatter: (w) => {
                const sum = w.globals.seriesTotals.reduce((a, b) => {
                  return a + b
                }, 0)
                return sum
              }
            },
            value: {
              show: true,
              fontFamily: 'Inter, sans-serif',
              offsetY: -20,
              formatter: function (value) {
                return value
              }
            }
          },
          size: '80%'
        }
      }
    },
    grid: {
      padding: {
        top: -2
      }
    },
    labels: category,
    dataLabels: {
      enabled: false
    },
    legend: {
      position: 'bottom',
      fontFamily: 'Inter, sans-serif'
    },
    yaxis: {
      labels: {
        formatter: function (value) {
          return value
        }
      }
    },
    xaxis: {
      labels: {
        formatter: function (value) {
          return value
        }
      },
      axisTicks: {
        show: false
      },
      axisBorder: {
        show: false
      }
    }
  }
  if (document.getElementById('donut-chart-tickets')) {
    const chart = new ApexCharts(document.getElementById('donut-chart-tickets'), pieTickets)
    chart.render()
  }

  // AREA ORDERS - Also set current cash el
  const orderTotalEl = document.querySelector('#order-total')
  const ordersByDate = await (
    await fetch(`/api/statistic/orders/date?eventId=${eventId}`, {
      method: 'GET'
    })
  ).json()

  orderTotalEl.innerHTML = ordersByDate.meta.total

  const date = ordersByDate.data.map((ord) => {
    return ord.time
  })
  const dateFreq = ordersByDate.data.map((ord) => {
    return ord.freq
  })
  const lineOpt = {
    chart: {
      maxWidth: '100%',
      type: 'area',
      fontFamily: 'Inter, sans-serif',
      dropShadow: {
        enabled: false
      },
      toolbar: {
        show: false
      }
    },
    tooltip: {
      enabled: true,
      x: {
        show: false
      }
    },
    fill: {
      type: 'gradient',
      gradient: {
        opacityFrom: 0.55,
        opacityTo: 0,
        shade: '#1C64F2',
        gradientToColors: ['#1C64F2']
      }
    },
    dataLabels: {
      enabled: false
    },
    stroke: {
      width: 6
    },
    grid: {
      show: false,
      strokeDashArray: 4,
      padding: {
        left: 2,
        right: 2,
        top: 0
      }
    },
    series: [
      {
        name: 'Orders',
        data: dateFreq,
        color: '#0d9488'
      }
    ],
    xaxis: {
      categories: date,
      labels: {
        show: false
      },
      axisBorder: {
        show: false
      },
      axisTicks: {
        show: false
      }
    },
    yaxis: {
      show: false
    }
  }
  if (document.getElementById('area-chart-orders')) {
    const chart = new ApexCharts(document.getElementById('area-chart-orders'), lineOpt)
    chart.render()
  }

  // PIE ATTENDERS AGE
  const attendersByAge = (
    await (
      await fetch(`/api/statistic/events/attenders/${eventId}/age`, {
        method: 'GET'
      })
    ).json()
  ).data
  const age = attendersByAge.map((att) => {
    return att.age
  })
  const ageFreq = attendersByAge.map((att) => {
    return att.freq
  })

  const pieAttendersAge = {
    series: ageFreq,
    colors: [
      '#FFA07A', // Light Salmon
      '#FFB6C1', // Light Pink
      '#87CEEB', // Sky Blue
      '#98FB98', // Pale Green
      '#FFD700', // Gold
      '#DDA0DD', // Plum
      '#BC8F8F', // Rosy Brown
      '#FF69B4', // Hot Pink
      '#F0E68C', // Khaki
      '#B0C4DE' // Light Steel Blue
    ],
    chart: {
      width: '100%',
      type: 'pie'
    },
    stroke: {
      colors: ['white'],
      lineCap: ''
    },
    plotOptions: {
      pie: {
        labels: {
          show: true
        },
        size: '100%',
        dataLabels: {
          offset: -25
        }
      }
    },
    labels: age,
    dataLabels: {
      enabled: true,
      style: {
        fontFamily: 'Inter, sans-serif'
      }
    },
    legend: {
      position: 'bottom',
      fontFamily: 'Inter, sans-serif'
    }
  }
  if (document.getElementById('pie-chart-attenders-age')) {
    const chart = new ApexCharts(
      document.getElementById('pie-chart-attenders-age'),
      pieAttendersAge
    )
    chart.render()
  }
})
