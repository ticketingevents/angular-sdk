import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse, HttpErrorResponse } from '@angular/common/http';

import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import * as constants from '../constants';

import { Section } from '../interface/section.interface';
import { SectionModel } from '../model/section.model';

@Injectable({
  providedIn: 'root'
})
export class SectionService{
  constructor(private _http: HttpClient){}

  retrieve(self: string): Promise<Section>{
    return new Promise<Section>((resolve, reject) => {
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
          section = new SectionModel(<Section>response.body, this._http);
        }

        resolve(section);
      })
    })
  }
}
