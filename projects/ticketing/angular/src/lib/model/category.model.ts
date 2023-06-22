import { ContentModel } from '../model/content.model';
import { Category } from '../interface/category.interface';

export class CategoryModel extends ContentModel implements Category{
  public name: string;
  public subcategories: Array<string>;
}
