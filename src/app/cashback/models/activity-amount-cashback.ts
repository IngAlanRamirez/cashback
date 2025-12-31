import { Amount } from './amount';

export interface ActivityAmountCashBack {
  name: string;
  categoryCode: string;
  categoryDescription: string;
  cashBackAmount: Amount;
  cashBackPercentage: number;
}

