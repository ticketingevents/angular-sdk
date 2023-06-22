import { Content } from './content.interface';

export interface Modifier extends Content{
  name: string
  priceDelta: number
  availableFrom: string
  availableTo: string
  minOrder: number
  maxOrder: number

  isActive?(quantity: number): boolean
}
