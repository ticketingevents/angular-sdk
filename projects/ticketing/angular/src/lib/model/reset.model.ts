import { Reset } from '../interface/reset.interface';

import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { HttpClient, HttpResponse, HttpErrorResponse } from '@angular/common/http';

export class ResetModel implements Reset{
  public status: string;
  private _self: string;
  private _httpClient: HttpClient;

  constructor(reset: any, httpClient: HttpClient){
    Object.assign(this,reset);

    this._self = reset.self;
    delete reset.self;

    this._httpClient = httpClient;
  }

  confirm(code: string): Promise<boolean>{
    return new Promise<boolean>((resolve) => {
      this._httpClient.post(this._self+"/confirmations",{code: code},{observe: 'response'})
      .pipe(
        catchError((error: HttpErrorResponse) => {
          resolve(false)
          return of(new HttpResponse<any>())
        })
      )
      .subscribe(response => {
        resolve(true)
      })
    })
  }
}
