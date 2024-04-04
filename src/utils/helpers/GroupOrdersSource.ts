interface Input {
  source: string
}

interface Output extends Input {
  freq: number
}

export const groupByOrdersSource = (orders: Input[]): Output[] => {
  const sourceFreq: any = {}

  // Hitung frekuensi masing-masing umur
  orders.forEach((order) => {
    const { source } = order
    sourceFreq[source] = (sourceFreq[source] || 0) + 1
  })

  // Ubah objek menjadi array
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  const result = Object.entries(sourceFreq).map(([source, freq]) => ({
    source,
    freq: Number(freq)
  }))

  return result
}
