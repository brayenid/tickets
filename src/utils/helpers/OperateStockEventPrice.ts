import type { Transaction } from '../../interfaces/Transaction'
import { operateEventPriceStocKService } from '../../services/event-prices'

/**
 *
 * This will undo event price stock value
 */
export const operateStock = async (
  transactions: Transaction[],
  operation: 'add' | 'min' = 'add'
): Promise<void> => {
  // LOOP THROUGH EACH TRANSACTION OBJECT
  for (let i = 0; i < transactions.length; i++) {
    const { quantity, eventPriceId } = transactions[i]

    // ANOTHER LOOP TO DO AN ADD OPERATION BASED ON TRANSACTION/ORD ITEM QTY
    for (let j = 0; j < (quantity ?? 0); j++) {
      await operateEventPriceStocKService(eventPriceId ?? '', operation)
    }
  }
}
