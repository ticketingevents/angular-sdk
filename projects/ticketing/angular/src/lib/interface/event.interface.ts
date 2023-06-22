import { Content } from './content.interface';

import { Category } from './category.interface';
import { Venue } from './venue.interface';
import { Section } from './section.interface';

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
}
