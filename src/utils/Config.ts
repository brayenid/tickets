export const config = {
  env: process.env.NODE_ENV?.trimEnd(),
  transaction: {
    fee: 5000
  },
  midtrans: {
    options: {
      clientKey: process.env.CLIENT_KEY ?? '',
      isProduction: process.env.NODE_ENV?.trimEnd() === 'production',
      serverKey: process.env.SERVER_KEY ?? ''
    }
  }
}
