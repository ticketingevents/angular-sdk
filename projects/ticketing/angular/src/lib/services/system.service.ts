import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse, HttpErrorResponse } from '@angular/common/http';

import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import * as constants from '../constants';

@Injectable({
  providedIn: 'root'
})
export class SystemService{
  constructor(private _http: HttpClient){}

  countries(): Promise<Array<string>>{
    return new Promise<Array<string>>((resolve,reject)=>{
      this._http.get("/countries", { observe: 'response' })
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
        let countries: Array<string> = [];
        if(response.body && response.body.countries){
          countries = response.body.countries
        }

        resolve(countries);
      })
    })
  }

  time(): Promise<number>{
    return new Promise<number>((resolve,reject)=>{
      this._http.get("/time", { observe: 'response' })
      .pipe(
        catchError((error: HttpErrorResponse) => {
          reject(constants.SERVER_ERROR);
          return of(new HttpResponse<any>());
        })
      )
      .subscribe(response => {
        let time = 0
        if(response.body && response.body.utc){
          time = response.body.time
        }

        resolve(time);
      })
    })
  }
}
