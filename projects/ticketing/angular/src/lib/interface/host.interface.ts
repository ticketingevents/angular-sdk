import { Content } from './content.interface';
import { Account } from './account.interface';
import { Event } from './event.interface';
import { Advertisement } from './advertisement.interface';

export interface Host extends Content{
  name: string;
  contact: string;
  email: string;
  description?: string;
  phone?: string;
  website?: string;
  businessNo?: string;
  firstAddressLine?: string;
  secondAddressLine?: string;
  city?: string;
  state?: string;
  country?: string;
  balance?: number;
  administrators?: Promise<Array<Account>>;
  events?: Promise<Array<Event>>;
  advertisements?: Promise<Array<Advertisement>>;
  addAdministrator?(administrator: Account): Promise<Array<Account>>;
  removeAdministrator?(administrator: Account): Promise<Array<Account>>;
  createEvent?(event: Event): Promise<Event>;
  createAdvertisement?(advertisement: Advertisement): Promise<Advertisement>;
}
