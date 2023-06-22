import { Content } from './content.interface';
import { Modifier } from './modifier.interface';
import { Ticket } from './ticket.interface';
import { Digest } from './digest.interface';

export interface Section extends Content{
  name: string;
  basePrice: number;
  salesStart: string;
  salesEnd: string;
  capacity: number;
  modifiers: Array<Modifier>;
  description?: string;
  remaining?: number;
  active?: boolean;

  getTickets?(status?: string, serial?: string, page?: number, results?: number): Promise<Array<Ticket>>;
  countTickets?(status?: string): Promise<number>;
  getDigest?(): Promise<Digest>;
  addModifier?(modifier: Modifier): Promise<Modifier>;
  getCurrentPrice?(quantity: number): Promise<{amount: number, availableFor: string, modifier: Modifier}>;
}
