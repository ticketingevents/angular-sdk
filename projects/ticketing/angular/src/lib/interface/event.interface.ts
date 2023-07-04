import { Content } from './content.interface';

import { Category } from './category.interface';
import { Venue } from './venue.interface';
import { Section } from './section.interface';
import { Ticket } from './ticket.interface';
import { Digest } from './digest.interface';

export interface Event extends Content{
  type: string
  title: string,
  description: string,
  category: Category,
  subcategory: string,
  venue: Venue,
  start: string,
  end: string,
  public: boolean,
  status?: string,
  banner?: string,
  thumbnail?: string,
  disclaimer?: string,
  tags?: Array<string>,
  popularity?: 0
  sections?: Array<Section>;
  showings?: Promise<Array<Event>>;
  sales?: Promise<any>;
  addSection?(section: Section): Promise<Section>;
  addShowing?(showing: Event): Promise<Event>;
  reload?(): Promise<boolean>;
  submit?(): Promise<boolean>;
  publish?(): Promise<boolean>;
  getTickets?(status?: string, serial?: string, sections?: Array<Section>, page?: number, results?: number): Promise<Array<Ticket>>;
  countTickets?(status?: string, sections?: Array<Section>): Promise<number>;
  getDigest?(sections?: Array<Section>): Promise<Digest>;
}
