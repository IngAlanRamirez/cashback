import { Location } from './location';

export interface Merchant {
  name?: string;
  categoryCode?: string;
  categoryDescription?: string;
  url?: string;
  location?: Location;
}

