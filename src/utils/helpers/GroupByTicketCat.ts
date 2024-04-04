interface Input {
  id?: string
  category: string
}

interface Output extends Input {
  freq: number
}

export const groupByTixCatFreq = (tickets: Input[]): Output[] => {
  const tixCatFreq: any = {}

  tickets.forEach((attender) => {
    const { category } = attender
    tixCatFreq[category] = (tixCatFreq[category] || 0) + 1
  })

  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  const result = Object.entries(tixCatFreq).map(([category, freq]) => ({
    category,
    freq: Number(freq)
  }))

  return result
}
