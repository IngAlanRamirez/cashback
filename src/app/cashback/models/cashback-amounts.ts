import { Amount } from './amount';
import { CashbackPeriod } from './cashback-period';

export interface CashBackAmounts {
  annualAmount: Amount;
  monthAmount: Amount;
  cashbackPeriod: CashbackPeriod;
}

