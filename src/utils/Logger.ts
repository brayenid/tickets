import winston from 'winston'

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(), // Menambahkan timestamp
    winston.format.json() // Format log menjadi JSON
  ),
  transports: [
    // Menambahkan transport untuk konsol
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(), // Menambahkan warna
        winston.format.simple() // Format log yang sederhana
      )
    }),
    // Menambahkan transport untuk file
    new winston.transports.File({ filename: 'app.log' })
  ]
})

export { logger }
