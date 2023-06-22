import { ContentModel } from '../model/content.model';
import { Modifier } from '../interface/modifier.interface';

export class ModifierModel extends ContentModel implements Modifier{
  public name: string;
  public priceDelta: number;
  public availableFrom: string;
  public availableTo: string;
  public minOrder: number;
  public maxOrder: number;
  public active: boolean;

  isActive(quantity: number): boolean{
    let minOrder = this.minOrder?this.minOrder:0;
    let maxOrder = this.maxOrder?this.maxOrder:Number.MAX_VALUE;

    return this.active && minOrder <= quantity && maxOrder >= quantity;
  }

  save(): Promise<boolean>{
    this.availableFrom = this.availableFrom.replace("T", " ")
    this.availableTo = this.availableTo.replace("T", " ")

    return super.save()
  }
}
