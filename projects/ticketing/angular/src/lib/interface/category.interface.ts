import { Content } from './content.interface';

export interface Category extends Content{
  name: string;
  subcategories: Array<string>;
}
