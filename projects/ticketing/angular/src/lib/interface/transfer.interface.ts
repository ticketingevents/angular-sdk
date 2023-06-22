import { Account } from './account.interface';
import { Event } from './event.interface';
import { Section } from './section.interface';

export interface Transfer{
  status: string;
  sender: Account;
  recipient: Account;
  event: Event;
  tickets: Array<{section: Section, requested: number}>

  addItem?(section: Section, requested: number): void;
  send?(recipient: Account): Promise<boolean>;
  claim?(): Promise<boolean>;
  cancel?(): Promise<boolean>;
  totalTickets?(): number;
}
