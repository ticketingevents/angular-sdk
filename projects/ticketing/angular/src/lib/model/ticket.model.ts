import { ContentModel } from '../model/content.model';
import { Ticket } from '../interface/ticket.interface';
import { Section } from '../interface/section.interface';
import { Account } from '../interface/account.interface';
import { AccountModel } from '../model/account.model';

import * as constants from '../constants';

import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { HttpClient, HttpResponse, HttpErrorResponse } from '@angular/common/http';

export class TicketModel extends ContentModel implements Ticket{
  public serial: string;
  public section: Section;
  public owner?: Account;
  public status: string;

  constructor(ticket: Ticket, httpClient: HttpClient){
    let owner = ticket.owner;
    delete ticket.owner;

    super(ticket, httpClient)

    this.owner = new AccountModel(owner, httpClient)
  }

  redeem(): Promise<boolean>{
    return new Promise<boolean>((resolve,reject)=>{
      this._httpClient.post(this._self+"/redemptions", {}, { observe: 'response' })
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
        if(response.body){
          resolve(response.body.success);
        }else{
          resolve(false)
        }
      })
    })
  }
}
