import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse, HttpErrorResponse } from '@angular/common/http';

import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import * as constants from '../constants';

import { Modifier } from '../interface/modifier.interface';
import { ModifierModel } from '../model/modifier.model';

@Injectable({
  providedIn: 'root'
})
export class ModifierService{
  constructor(private _http: HttpClient){}

  retrieve(self: string): Promise<Modifier>{
    return new Promise<Modifier>((resolve, reject) => {
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
        let section = null;
        if(response.body){
          section = new ModifierModel(<Modifier>response.body, this._http);
        }

        resolve(section);
      })
    })
  }
}
