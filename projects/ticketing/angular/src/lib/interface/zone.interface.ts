import { Advertisement } from './advertisement.interface';

export interface Zone{
  name: string;
  description: string;
  height: number;
  width: number;

  number?: string;
  advertisements?: Promise<Array<Advertisement>>;
  getRandomAds?(count: number): Promise<Array<Advertisement>>;
}
