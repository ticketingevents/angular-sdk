import { Session } from '../interface/session.interface';
import { Account } from '../interface/account.interface';

import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { StorageService } from '../services/storage.service';

import { HttpClient, HttpResponse, HttpErrorResponse } from '@angular/common/http';

export class SessionModel implements Session{
  public id: string;
  public started: string;
  public open: boolean;
  public key: string;
  public account: Account;

  private _self: string;
  private _httpClient: HttpClient;
  private _storageService: StorageService;

  constructor(session: Session, self: string, httpClient: HttpClient, storageService: StorageService){
    Object.assign(this,session);

    this._self = self;
    this._httpClient = httpClient;
    this._storageService = storageService;
  }

  end(): Promise<boolean>{
    return new Promise<boolean>((resolve) => {
      this._httpClient.delete(this._self,{observe: 'response'})
      .pipe(
        catchError((error: HttpErrorResponse) => {
          resolve(false)
          return of(new HttpResponse<any>())
        })
      )
      .subscribe(response => {
        this._storageService.delete("apiKey");
        resolve(true)
      })
    })
  }
}
