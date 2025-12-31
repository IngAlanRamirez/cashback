import { Amount } from './amount';
import { Clearing } from './clearing';
import { Merchant } from './merchant';

export interface Purchase {
  cardTransactionId: string;
  acquirerReferenceNumber: string;
  orderDate: string;
  amount: Amount;
  clearing: Clearing;
  merchant: Merchant;
}

