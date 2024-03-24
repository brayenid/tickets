interface Input {
  gender: string
}

interface Output extends Input {
  freq: number
}

export const groupByGenderFreq = (attenders: Input[]): Output[] => {
  const genderFreq: any = {}

  // Hitung frekuensi masing-masing umur
  attenders.forEach((attender) => {
    const { gender } = attender
    genderFreq[gender] = (genderFreq[gender] || 0) + 1
  })

  // Ubah objek menjadi array
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  const result = Object.entries(genderFreq).map(([gender, freq]) => ({
    gender,
    freq: Number(freq)
  }))

  return result
}
