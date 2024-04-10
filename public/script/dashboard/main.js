/* eslint-disable */
document.addEventListener('DOMContentLoaded', async () => {
  const ordersByDate = await (
    await fetch('/api/statistic/orders/date', {
      method: 'GET'
    })
  ).json()

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
        shade: '#fda486',
        gradientToColors: ['#fda486']
      }
    },
    dataLabels: {
      enabled: true
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
        color: '#fda4af'
      }
    ],
    xaxis: {
      categories: date,
      labels: {
        show: true
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
})
