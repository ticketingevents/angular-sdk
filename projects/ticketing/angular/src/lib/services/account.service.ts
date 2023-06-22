import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse, HttpErrorResponse } from '@angular/common/http';

import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import * as constants from '../constants';

import { Reset } from '../interface/reset.interface';
import { ResetModel } from '../model/reset.model';

import { Account } from '../interface/account.interface';
import { AccountModel } from '../model/account.model';

@Injectable({
  providedIn: 'root'
})
export class AccountService{
  constructor(private _http: HttpClient){}

  create(account: Account, password: string): Promise<Account>{
    let payload: any = account;
    payload.password = password;

    return new Promise<Account>((resolve, reject) => {
      this._http.post("/accounts",payload, { observe: 'response' })
      .pipe(
        catchError((error: HttpErrorResponse) => {
          switch(error.status){
            case 400:
              reject(constants.INVALID_VALUES);
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
        let account = null;
        if(response.body){
          account = new AccountModel(<Account>response.body,this._http);
        }

        resolve(account);
      })
    })
  }

  retrieve(number: string): Promise<Account>{
    return new Promise<Account>((resolve, reject) => {
      this._http.get("/accounts/"+number,{observe: 'response'})
      .pipe(
        catchError((error: HttpErrorResponse) => {
          switch(error.status){
            case 401:
              reject(constants.UNAUTHORISED_ACCESS);
              break;
            default:
              reject(constants.SERVER_ERROR);
          }

          return of(new HttpResponse<any>())
        })
      )
      .subscribe(response => {
        let account = null;
        if(response.body){
          account = new AccountModel(<Account>response.body,this._http);
        }

        resolve(account);
      })
    })
  }

  findUser(identification: string): Promise<Account>{
    if(identification){
      return new Promise<Account>((resolve, reject) => {
        this._http.get("/users/"+identification,{observe: 'response'})
        .pipe(
          catchError((error: HttpErrorResponse) => {
            switch(error.status){
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
          let account = null;
          if(response.body){
            account = new AccountModel(<Account>response.body,this._http);
          }

          resolve(account);
        })
      })
    }else{
      return new Promise((resolve, reject) => {
        resolve(null)
      })
    }
  }

  requestReset(identification: string, password: string): Promise<Reset>{
    return new Promise<Reset>((resolve, reject) => {
      this._http.post("/resets",{identification: identification, password: password},{observe: 'response'})
      .pipe(
        catchError((error: HttpErrorResponse) => {
          switch(error.status){
            case 400:
              reject(constants.INVALID_VALUES);
              break;
            case 401:
              reject(constants.UNAUTHORISED_ACCESS);
              break;
            default:
              reject(constants.SERVER_ERROR);
          }

          return of(new HttpResponse<any>())
        })
      )
      .subscribe(response => {
        let reset = null;
        if(response.body){
          reset = new ResetModel(response.body,this._http);
        }

        resolve(reset);
      })
    })
  }
}
