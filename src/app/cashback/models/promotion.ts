import { Image } from './image';
import { Merchant } from './merchant';
import { StatusInfo } from './status-info';
import { Period } from './period';

export interface Promotion {
  promotionId: string;
  description: string;
  percentage: number;
  statusInfo: StatusInfo;
  period: Period;
  creationDate: string;
  expirationDate: string;
  position: number;
  image: Image;
  merchant: Merchant;
  isUniqueRewards: boolean;
}

