import { Content } from './content.interface';

export interface Venue extends Content{
  name: string;
  address: string;
  longitude?: number;
  latitude?: number;
  map?: string;
}
