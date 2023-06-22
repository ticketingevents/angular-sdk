import { Event } from './event.interface';
import { Section } from './section.interface';
import { Modifier } from './modifier.interface';
import { BillingInformation } from './billing.interface';

export interface Order{
  number: string;
  status: string;
  placed: Date;
  items: Array<{event: Event, section: Section, modifier: Modifier, quantity: number}>;
  convenienceFees: number;
  total: number;
  timeLeft: {minutes: number, seconds: number};

  addItem?(section: Section, quantity: number): Promise<boolean>;
  place?(): Promise<boolean>;
  cancel?(): Promise<boolean>;
  pay?(billingInformation: BillingInformation): Promise<boolean>;
  syncTime(): Promise<boolean>;
}
