import { AssociatedAccount } from './associated-account';
import { Image } from './image';
import { CardIdentification } from './card-identification';

export interface Product {
  cardIdentification?: CardIdentification;
  type?: string;
  isBlocked?: boolean;
  associatedAccounts?: AssociatedAccount[];
  image?: Image;
  product?: {
    name?: string;
  };
  currentProduct?: any;
}

