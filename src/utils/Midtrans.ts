import * as MidtransClient from 'midtrans-client'
import { config } from '../utils/Config'

export const midtrans = new MidtransClient.Snap(config.midtrans.options)

export const midtransCore = new MidtransClient.CoreApi(config.midtrans.options)
