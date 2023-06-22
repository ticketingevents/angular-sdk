import { Content } from './content.interface';
import { Section } from './section.interface';
import { Account } from './account.interface';

export interface Ticket extends Content{
  serial: string;
  section: Section;
  owner?: Account;
  status: string;
  redeem?(): Promise<boolean>;
}
