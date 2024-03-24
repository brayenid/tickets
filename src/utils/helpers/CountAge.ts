export const countAge = (birth: string): number => {
  const today = new Date()

  // Memisahkan tanggal lahir menjadi tahun, bulan, dan hari
  const birthMonth = parseInt(birth.split('-')[1])
  const birthDay = parseInt(birth.split('-')[2])

  // Mendapatkan tanggal lahir dari input
  const birthDate = new Date(birth)

  // Menghitung selisih tahun antara tanggal saat ini dan tanggal lahir
  let age = today.getFullYear() - birthDate.getFullYear()

  // Menyesuaikan jika tanggal saat ini belum melewati ulang tahun
  if (today.getMonth() < birthMonth - 1 || (today.getMonth() === birthMonth - 1 && today.getDate() < birthDay)) {
    age--
  }

  return age
}
