import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse, HttpErrorResponse, HttpParams } from '@angular/common/http';

import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import * as constants from '../constants';

import { Zone } from '../interface/zone.interface'
import { ZoneModel } from '../model/zone.model';
import { Advertisement } from '../interface/advertisement.interface'
import { AdvertisementModel } from '../model/advertisement.model';

@Injectable({
  providedIn: 'root'
})
export class AdvertisementService{
  constructor(private _http: HttpClient){}

  createZone(zone: Zone): Promise<Zone>{
    return new Promise<Zone>((resolve, reject)=>{
      this._http.post("/zones", zone, { observe: 'response' })
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
        let zone = null;
        if(response.body){
          zone = new ZoneModel(response.body,this._http);
        }

        resolve(zone);
      })
    })
  }

  listZones(): Promise<Array<Zone>>{
    return this._list();
  }

  findZone(number: string): Promise<Zone>{
    return new Promise<Zone>((resolve,reject)=>{
      this._list(number).then(zones => {
        if(zones.length > 0){
          resolve(zones[0])
        }else{
          resolve(null)
        }
      }).catch((error: number) => {
        reject(error);
      })
    })
  }

  submissions(): Promise<Array<Advertisement>>{
    return new Promise<Array<Advertisement>>((resolve,reject)=>{
      this._http.get("/ad-submissions", { observe: 'response' })
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
        let advertisements: Array<Advertisement> = [];
        if(response.body && Array.isArray(response.body.entries)){
          for(let entry of response.body.entries){
            advertisements.push(new AdvertisementModel(entry,this._http));
          }
        }

        resolve(advertisements);
      })
    })
  }

  retrieve(self: string): Promise<Advertisement>{
    return new Promise<Advertisement>((resolve, reject) => {
      this._http.get(self, {observe: 'response'})
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

          return of(new HttpResponse<any>())
        })
      )
      .subscribe(response => {
        let venue = null;
        if(response.body){
          venue = new AdvertisementModel(<Advertisement>response.body, this._http);
        }

        resolve(venue);
      })
    })
  }

  private _list(number: string = ""): Promise<Array<Zone>>{
    return new Promise<Array<Zone>>((resolve,reject)=>{
      let params = new HttpParams();
      if(number){
        params = params.set("number",number)
      }

      this._http.get("/zones", { observe: 'response', params: params })
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
        let zones: Array<Zone> = [];
        if(response.body && Array.isArray(response.body.entries)){
          for(let entry of response.body.entries){
            zones.push(new ZoneModel(entry,this._http));
          }
        }

        resolve(zones);
      })
    })
  }
}
