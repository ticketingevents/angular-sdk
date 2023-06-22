import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse, HttpErrorResponse, HttpHeaders } from '@angular/common/http';

import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import * as constants from '../constants';
import { StorageService } from './storage.service';

import { Session } from '../interface/session.interface';
import { SessionModel } from '../model/session.model';
import { AccountModel } from '../model/account.model';

@Injectable({
  providedIn: 'root'
})
export class SessionService{
  constructor(private _http: HttpClient, private _storageService: StorageService){}

  start(identification: string, password: string): Promise<Session>{
      return new Promise<Session>((resolve, reject) => {
   	 		this._storageService.delete("apiKey");
        this._http.post("/sessions", {identification: identification, password: password}, { observe: 'response' })
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
          let session: Session = null;
          if(response.body){
            session = new SessionModel(<Session>response.body,response.body.self,this._http,this._storageService);
            session.account = new AccountModel(session.account,this._http);
            this._storageService.store("apiKey",session.key);
          }

          resolve(session);
        })
    })
  }

  continue(key: string): Promise<Session>{
    return new Promise<Session>((resolve, reject) => {
      this._storageService.store("apiKey", key);
      this._http.get("/sessions/"+key, {observe: 'response'})
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
        let session: Session = null;
        if(response.body){
          session = new SessionModel(<Session>response.body,response.body.self,this._http,this._storageService);
          session.account = new AccountModel(session.account,this._http);
          this._storageService.store("apiKey",session.key);
        }

        resolve(session);
      })
    })
  }
}
