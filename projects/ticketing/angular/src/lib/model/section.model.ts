import { ContentModel } from '../model/content.model';
import { Section } from '../interface/section.interface';
import { Modifier } from '../interface/modifier.interface';
import { ModifierModel } from '../model/modifier.model';
import * as constants from '../constants';

import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { HttpClient, HttpResponse, HttpParams, HttpErrorResponse } from '@angular/common/http';

export class SectionModel extends ContentModel implements Section{
  public name: string;
  public basePrice: number;
  public salesStart: string;
  public salesEnd: string;
  public capacity: number;
  public remaining: number;
  public description: string;
  public active: boolean;
  public modifiers: Array<Modifier>;

  constructor(section: Section, httpClient: HttpClient){
    let modifiers = section.modifiers;
    delete section.modifiers;

    super(section, httpClient)

    this.modifiers = [];
    if(Array.isArray(modifiers)){
      for(let modifier of modifiers){
        this.modifiers.push(new ModifierModel(modifier, httpClient));
      }
    }
  }

  getCurrentPrice(quantity: number): Promise<{amount: number, availableFor: string, modifier: Modifier}>{
    return new Promise<{amount: number, availableFor: string, modifier: Modifier}>((resolve, reject) => {
      let params = new HttpParams()
      params = params.set("quantity", quantity)
      params = params.set("cache", "nocache")

      this._httpClient.get(`${this._self}/price`, { observe: 'response', params: params })
      .pipe(
        catchError((error: HttpErrorResponse) => {
          switch(error.status){
            case 401:
              reject(constants.UNAUTHORISED_ACCESS);
              break;
            default:
              reject(constants.SERVER_ERROR);
          }

          return of(new HttpResponse<any>());
        })
      )
      .subscribe(response => {
        let price = {
          amount: response.body.amount,
          availableFor: response.body.availableFor,
          modifier: null
        }

        if(!Array.isArray(response.body.modifier)){
          price.modifier = new ModifierModel(response.body.modifier, this._httpClient)
        }

        resolve(price)
      })
    })
  }

  addModifier(modifier: Modifier): Promise<Modifier>{
    modifier.availableFrom = modifier.availableFrom.replace("T", " ")
    modifier.availableTo = modifier.availableTo.replace("T", " ")

    return new Promise<Modifier>((resolve,reject)=>{
      this._httpClient.post(this._self+"/modifiers", modifier, { observe: 'response' })
      .pipe(
        catchError((error: HttpErrorResponse) => {
          switch(error.status){
            case 400:
              reject(constants.INVALID_VALUES);
              break;
            case 401:
              reject(constants.UNAUTHORISED_ACCESS);
              break;
            case 409:
              reject(constants.NOT_UNIQUE);
              break;
            default:
              reject(constants.SERVER_ERROR);
          }

          return of(new HttpResponse<any>());
        })
      )
      .subscribe(response => {
        let modifier = null;
        if(response.body){
          modifier = new ModifierModel(response.body, this._httpClient)
          this.modifiers.push(modifier);
        }

        resolve(modifier);
      })
    })
  }

  save(): Promise<boolean>{
    this.salesStart = this.salesStart.replace("T", " ")
    this.salesEnd = this.salesEnd.replace("T", " ")

    return super.save()
  }
}
