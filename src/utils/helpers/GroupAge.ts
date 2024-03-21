interface Input {
  age: number
}

interface Output extends Input {
  freq: number
}

export const groupByAgeFreq = (attenders: Input[]): Output[] => {
  const ageFreq: any = {}

  // Hitung frekuensi masing-masing umur
  attenders.forEach((attender) => {
    const { age } = attender
    ageFreq[age] = (ageFreq[age] || 0) + 1
  })

  // Ubah objek menjadi array
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  const result = Object.entries(ageFreq).map(([age, freq]) => ({
    age: parseInt(age),
    freq: Number(freq)
  }))

  return result
}
