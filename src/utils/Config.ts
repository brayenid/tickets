console.log({
  mode: process.env.NODE_ENV ?? 'prod'
})

export const config = {
  env: process.env.NODE_ENV?.trimEnd(),
  host: process.env.HOST,
  protocol: process.env.PROTOCOL,
  transaction: {
    fee: 5000
  },
  mail: {
    address: process.env.MAIL_ADD
  },
  midtrans: {
    options: {
      clientKey: process.env.CLIENT_KEY ?? '',
      isProduction: process.env.NODE_ENV?.trimEnd() !== 'dev',
      serverKey: process.env.SERVER_KEY ?? ''
    }
  }
}
