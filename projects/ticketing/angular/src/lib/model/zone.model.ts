import { Advertisement } from '../interface/advertisement.interface';
import { AdvertisementModel } from '../model/advertisement.model';
import { Zone } from '../interface/zone.interface';

import * as constants from '../constants';

import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { HttpClient, HttpResponse, HttpErrorResponse } from '@angular/common/http';

export class ZoneModel implements Zone{
  public name: string;
  public number: string;
  public description: string;
  public height: number;
  public width: number;

  private _advertisements: string;
  private _advertisementsPromise: Promise<Array<Advertisement>>;
  private _httpClient: HttpClient;

  constructor(zone: any, httpClient: HttpClient){
    this._advertisements = zone.advertisements;

    delete zone.self;
    delete zone.advertisements;

    Object.assign(this,zone);

    this._httpClient = httpClient;
    this._advertisementsPromise = null
  }

  get advertisements(): Promise<Array<Advertisement>>{
    if(!this._advertisementsPromise){
      this._advertisementsPromise = new Promise<Array<Advertisement>>(this._loadAdvertisements.bind(this))
    }

    return this._advertisementsPromise;
  }

  getRandomAds(count: number): Promise<Array<Advertisement>>{
    return new Promise((resolve, reject)=>{
      this.advertisements.then(advertisements => {
        var currentIndex = advertisements.length, temporaryValue, randomIndex;

        while (0 !== currentIndex) {
          randomIndex = Math.floor(Math.random() * currentIndex);
          currentIndex -= 1;

          temporaryValue = advertisements[currentIndex];
          advertisements[currentIndex] = advertisements[randomIndex];
          advertisements[randomIndex] = temporaryValue;
        }

        resolve(advertisements.slice(0,count))
      })
    })
  }

  private _loadAdvertisements(resolve: any,reject: any){
    this._httpClient.get(this._advertisements, { observe: 'response' })
    .pipe(
      catchError((error: HttpErrorResponse) => {
        switch(error.status){
          case 401:
            reject(constants.UNAUTHORISED_ACCESS);
            break;
          case 404:
            reject(constants.NOT_FOUND);
            break;
          default:
            reject(constants.SERVER_ERROR);
        }

        return of(new HttpResponse<any>());
      })
    )
    .subscribe(response => {
      let advertisements: Array<Advertisement> = [];
      if(response.body && Array.isArray(response.body.entries)){
        for(let entry of response.body.entries){
          advertisements.push(new AdvertisementModel(entry,this._httpClient));
        }
      }

      resolve(advertisements);
    })
  }
}
