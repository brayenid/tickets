console.log({
  mode: process.env.NODE_ENV ?? 'prod',
  run: process.env.ENV_RUN ?? 'unknown'
})

export const config = {
  env: process.env.NODE_ENV?.trimEnd(),
  run: process.env.ENV_RUN,
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
