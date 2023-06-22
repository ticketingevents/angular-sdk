import { Account } from '../interface//account.interface';
import { AccountModel } from '../model/account.model';
import { Event } from '../interface//event.interface';
import { EventModel } from '../model/event.model';
import { Section } from '../interface//section.interface';
import { SectionModel } from '../model/section.model';
import { Transfer } from '../interface/transfer.interface';

import * as constants from '../constants';

import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { HttpClient, HttpResponse, HttpErrorResponse } from '@angular/common/http';

export class TransferModel implements Transfer{
  public status: string;
  public sender: Account;
  public recipient: Account;
  public event: Event;
  public tickets: Array<{section: Section, requested: number}>

  private _self: string;
  private _httpClient: HttpClient;

  constructor(transfer: any, httpClient: HttpClient){
    this._self = transfer.self;
    this._httpClient = httpClient;

    if(transfer.sender){
      this.sender = new AccountModel(transfer.sender,this._httpClient);
    }

    if(transfer.recipient){
      this.recipient = new AccountModel(transfer.recipient,this._httpClient);
    }

    if(transfer.event){
      this.event = new EventModel(transfer.event,this._httpClient);
    }

    if(transfer.tickets){
      this.tickets = [];
      for(let ticket of transfer.tickets){
        this.tickets.push({
          section: new SectionModel(ticket.section, httpClient),
          requested: ticket.requested
        });
      }
    }

    delete transfer.self;
    delete transfer.sender;
    delete transfer.recipient;
    delete transfer.event;
    delete transfer.tickets;

    Object.assign(this,transfer)
  }

  addItem(section: Section, requested: number): void{
    if(this.status == "Opened"){
      let exists = false;
      for(let item of this.tickets){
        if(item.section.self == section.self){
          exists = true;
          item.requested = requested;
          break;
        }
      }

      if(!exists){
        this.tickets.push({
          section: section,
          requested: requested
        })
      }
    }
  }

  send(recipient: Account): Promise<boolean>{
    return new Promise<boolean>((resolve,reject)=>{
      if(this.status !== "Opened" || this.tickets.length == 0){
        reject(constants.INVALID_STATE)
        return;
      }

      let payload = {
        recipient: recipient.number,
        tickets:{}
      }

      for(let ticket of this.tickets){
        payload["tickets"][ticket.section.id] = parseInt(ticket.requested.toString());
      }

      this._httpClient.post("/accounts/"+this.sender.number+"/transfers", payload, { observe: 'response' })
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
              reject(constants.INVALID_STATE);
              break;
            default:
              reject(constants.SERVER_ERROR);
          }

          return of(new HttpResponse<any>());
        })
      )
      .subscribe(response => {
        if(response.body){
          this._self = response.body.self;
          this.status = response.body.status;
          this.event = new EventModel(response.body.event,this._httpClient);

          resolve(true);
        }else{
          resolve(false);
        }
      })
    })
  }

  claim(): Promise<boolean>{
    return this._modify("claim");
  }

  cancel(): Promise<boolean>{
    return this._modify("cancellation");
  }

  totalTickets(): number{
    let totalTickets = 0;

    for(let ticket of this.tickets){
      totalTickets += ticket.requested;
    }

    return totalTickets;
  }

  private _modify(action: string): Promise<boolean>{
    return new Promise<boolean>((resolve,reject)=>{
      if(this.status !== "Pending"){
        reject(constants.INVALID_STATE)
        return;
      }

      this._httpClient.post(this._self+"/"+action+"s", {}, { observe: 'response' })
      .pipe(
        catchError((error: HttpErrorResponse) => {
          switch(error.status){
            case 401:
              reject(constants.UNAUTHORISED_ACCESS);
              break;
            case 409:
              reject(constants.INVALID_STATE);
              break;
            default:
              reject(constants.SERVER_ERROR);
          }

          return of(new HttpResponse<any>());
        })
      )
      .subscribe(response => {
        if(response.body){
          this.status = (action=="claim")?"Claimed":"Cancelled";
          resolve(response.body.success);
        }else{
          resolve(false)
        }
      })
    })
  }
}
