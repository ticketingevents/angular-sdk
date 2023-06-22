import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse, HttpErrorResponse } from '@angular/common/http';

import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import * as constants from '../constants';

import { Account } from '../interface/account.interface'
import { Host } from '../interface/host.interface'
import { HostModel } from '../model/host.model';

@Injectable({
  providedIn: 'root'
})
export class HostService{
  constructor(private _http: HttpClient){}

  create(host: Host, administrator: Account): Promise<Host>{
    return new Promise<Host>((resolve, reject)=>{
      this._http.post("/accounts/"+administrator.number+"/hosts",host, { observe: 'response' })
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
        let host = null;
        if(response.body){
          host = new HostModel(response.body,this._http);
        }

        resolve(host);
      })
    })
  }

  list(administrator: Account): Promise<Array<Host>>{
    return new Promise<Array<Host>>((resolve,reject)=>{
      this._http.get("/accounts/"+administrator.number+"/hosts", { observe: 'response' })
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
        let hosts: Array<Host> = [];
        if(response.body && Object.keys(response.body.entries).length){
          for(let entry of response.body.entries){
            hosts.push(new HostModel(entry,this._http));
          }
        }

        resolve(hosts);
      })
    })
  }

  retrieve(self: string): Promise<Host>{
    return new Promise<Host>((resolve, reject) => {
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
        let host = null;
        if(response.body){
          host = new HostModel(<Host>response.body, this._http);
        }

        resolve(host);
      })
    })
  }
}
