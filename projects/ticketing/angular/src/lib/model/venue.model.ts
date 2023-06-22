import { ContentModel } from '../model/content.model';
import { Venue } from '../interface/venue.interface';

export class VenueModel extends ContentModel implements Venue{
  public name: string;
  public address: string;
  public latitude: number;
  public longitude: number;
}
