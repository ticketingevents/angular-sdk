import { Account } from '../interface/account.interface';
import { ActivitySummary } from '../interface/activity-summary.interface';
import { Verification } from '../interface/verification.interface';
import { Order } from '../interface/order.interface';
import { OrderModel } from '../model/order.model';
import { Transfer } from '../interface/transfer.interface';
import { TransferModel } from '../model/transfer.model';
import { Ticket } from '../interface/ticket.interface';
import { TicketModel } from '../model/ticket.model';
import { Section } from '../interface/section.interface';

import * as constants from '../constants';

import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { HttpClient, HttpResponse, HttpErrorResponse } from '@angular/common/http';

export class AccountModel implements Account{
  public username: string
  public email: string;
  public number: string;
  public role: string;
  public verified: boolean;
  public activated: boolean;
  public title: string;
  public firstName: string;
  public lastName: string;
  public dateOfBirth: string;
  public phone: string;
  public firstAddressLine:string;
  public secondAddressLine:string;
  public city: string;
  public state: string;
  public country: string;

  private _httpClient: HttpClient;

  constructor(account: Account, httpClient: HttpClient){
    Object.assign(this,account);

    this._httpClient = httpClient;
  }

  verify(code: string): Promise<boolean>{
    return new Promise<boolean>((resolve, reject) => {
      this._httpClient.post("/verifications",{account: this.number, code: code}, {observe: 'response'})
      .pipe(
        catchError((error: HttpErrorResponse) => {
          switch(error.status){
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
          let verification: Verification = <Verification>response.body;
          this.verified = verification?verification.succeeded:false;
          resolve(this.verified)
      })
    })
  }

  resendVerification(): Promise<boolean>{
    return new Promise<boolean>((resolve, reject) => {
      if(this.verified){
        reject(constants.NOT_UNIQUE);
      }

      this._httpClient.post("/accounts/"+this.number+"/resends",{}, {observe: 'response'})
      .pipe(
        catchError((error: HttpErrorResponse) => {
          switch(error.status){
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
          resolve(response.body?response.body.success:false)
      })
    })
  }

  activate(reason: string): Promise<boolean>{
    return new Promise<boolean>((resolve, reject) => {
      this._httpClient.post(
        `/accounts/${this.number}/activations`,
        {reason: reason},
        {observe: 'response'}
      ).pipe(
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
        this.activated = response.body.activation
        resolve(response.body.activation);
      })
    })
  }

  deactivate(reason: string): Promise<boolean>{
    return new Promise<boolean>((resolve, reject) => {
      this._httpClient.post(
        `/accounts/${this.number}/deactivations`,
        {reason: reason},
        {observe: 'response'}
      ).pipe(
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
        this.activated = response.body.activation
        resolve(!response.body.activation);
      })
    })
  }

  startOrder(): Order{
    return new OrderModel({
      self:"",
      status:"Opened",
      number:"",
      placed:"",
      items:[]
    },this.number,this._httpClient);
  }

  startTransfer(): Transfer{
    return new TransferModel({
      self:"",
      status:"Opened",
      sender:this,
      recipient:null,
      event:null,
      tickets:[]
    },this._httpClient);
  }

  listWallet(section: Section = null): Promise<Array<Ticket>>{
    return new Promise<Array<Ticket>>((resolve, reject) => {
      this._httpClient.get("/accounts/"+this.number+"/wallet"+(section?"?section="+section.id:""),{observe: 'response'})
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
        let tickets: Array<Ticket> = [];
        if(response.body && Object.keys(response.body.entries).length){
          for(let entry of response.body.entries){
            tickets.push(new TicketModel(entry, this._httpClient));
          }
        }

        resolve(tickets);
      })
    })
  }

  listPendingTransferRequests(): Promise<Array<Transfer>>{
    return this._listTransfers("recipient","Pending");
  }

  listPendingTransfersSent(): Promise<Array<Transfer>>{
    return this._listTransfers("sender","Pending");
  }

  getActivity(): Promise<ActivitySummary>{
    return new Promise<ActivitySummary>((resolve, reject) => {
      this._httpClient.get("/accounts/"+this.number+"/activity",{observe: 'response'})
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
        resolve(response.body);
      })
    })
  }

  private _listTransfers(role: string, status: string): Promise<Array<Transfer>>{
    return new Promise<Array<Transfer>>((resolve, reject) => {
      this._httpClient.get("/accounts/"+this.number+"/transfers?role="+role+"&status="+status,{observe: 'response'})
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
        let transfers: Array<Transfer> = [];
        if(response.body && Object.keys(response.body.entries).length){
          for(let entry of response.body.entries){
            transfers.push(new TransferModel(entry,this._httpClient));
          }
        }

        resolve(transfers);
      })
    })
  }
}
