import * as constants from '../constants';
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { HttpClient, HttpResponse, HttpErrorResponse } from '@angular/common/http';

export class ContentModel{
  protected _self: string;
  protected _id: string;
  protected _httpClient: HttpClient;

  constructor(content: any, httpClient: HttpClient){
    this._self = content.self;
    this._id = content.self.match(/([0-9]+)$/g)[0];
    this._httpClient = httpClient;

    delete content.self;
    Object.assign(this, content)
  }

  get self(): string{
    return this._self;
  }

  get id(): string{
    return this._id;
  }

  save(): Promise<boolean>{
    return new Promise<boolean>((resolve,reject)=>{
      this._httpClient.put(this._self, this, { observe: 'response' })
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
        resolve(true);
      })
    })
  }

  delete(): Promise<boolean>{
    return new Promise<boolean>((resolve,reject)=>{
      this._httpClient.delete(this._self, { observe: 'response' })
      .pipe(
        catchError((error: HttpErrorResponse) => {
          switch(error.status){
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
        resolve(true);
      })
    })
  }
}
