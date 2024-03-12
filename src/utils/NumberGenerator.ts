export const generateRandomNumbers = (length: number = 6): string => {
  let randomNumber = ''
  for (let i = 0; i < length; i++) {
    randomNumber += Math.floor(Math.random() * 10)
  }
  return randomNumber
}
