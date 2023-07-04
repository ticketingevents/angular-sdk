import { Content } from './content.interface';
import { Modifier } from './modifier.interface';

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

  addModifier?(modifier: Modifier): Promise<Modifier>;
  getCurrentPrice?(quantity: number): Promise<{amount: number, availableFor: string, modifier: Modifier}>;
}
