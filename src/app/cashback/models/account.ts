import { Contract } from './contract';
import { Balances } from './balances';
import { StatusInfo } from './status-info';

export interface Account {
  contract: Contract;
  typeCode: string;
  statusInfo: StatusInfo;
  balances: Balances[];
}

