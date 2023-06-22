import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse, HttpErrorResponse } from '@angular/common/http';

import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import * as constants from '../constants';

import { Venue } from '../interface/venue.interface';
import { VenueModel } from '../model/venue.model';

@Injectable({
  providedIn: 'root'
})
export class VenueService{
  constructor(private _http: HttpClient){}

  list(): Promise<Array<Venue>>{
    return new Promise<Array<Venue>>((resolve,reject)=>{
      this._http.get("/venues", { observe: 'response' })
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
        let venues: Array<Venue> = [];
        if(response.body && Array.isArray(response.body.entries)){
          for(let entry of response.body.entries){
            venues.push(new VenueModel(entry,this._http));
          }
        }

        resolve(venues);
      })
    })
  }

  create(venue: Venue): Promise<Venue>{
    return new Promise<Venue>((resolve, reject) => {
      this._http.post("/venues", venue, { observe: 'response' })
      .pipe(
        catchError((error: HttpErrorResponse) => {
          switch(error.status){
            case 400:
              reject(constants.INVALID_VALUES);
              break;
            default:
              reject(constants.SERVER_ERROR);
          }

          return of(new HttpResponse<any>());
        })
      )
      .subscribe(response => {
        let venue = null;
        if(response.body){
          venue = new VenueModel(<Venue>response.body, this._http);
        }

        resolve(venue);
      })
    })
  }

  retrieve(self: string): Promise<Venue>{
    return new Promise<Venue>((resolve, reject) => {
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
          venue = new VenueModel(<Venue>response.body, this._http);
        }

        resolve(venue);
      })
    })
  }
}
