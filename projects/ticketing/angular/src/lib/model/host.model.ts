import { ContentModel } from '../model/content.model';
import { Host } from '../interface/host.interface';
import { Account } from '../interface/account.interface';
import { AccountModel } from '../model/account.model';
import { Event } from '../interface/event.interface';
import { EventModel } from '../model/event.model';
import { Advertisement } from '../interface/advertisement.interface';
import { AdvertisementModel } from '../model/advertisement.model';

import * as constants from '../constants';

import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { HttpClient, HttpResponse, HttpErrorResponse } from '@angular/common/http';

export class HostModel extends ContentModel implements Host{
  public name: string;
  public contact: string;
  public email: string;
  public description?: string;
  public phone?: string;
  public website?: string;
  public businessNo?: string;
  public firstAddressLine?: string;
  public secondAddressLine?: string;
  public city?: string;
  public state?: string;
  public country?: string;
  public balance: number;

  private _administrators: string;
  private _administratorsPromise: Promise<Array<Account>>;
  private _events: string;
  private _eventsPromise: Promise<Array<Event>>;
  private _advertisements: string;
  private _advertisementsPromise: Promise<Array<Advertisement>>;

  constructor(host: any, httpClient: HttpClient){
    let administrators = host.administrators;
    let events = host.events;
    let advertisements = host.advertisements;
    delete host.administrators;
    delete host.events;
    delete host.advertisements;

    super(host, httpClient)

    this._administrators = administrators
    this._events = events
    this._advertisements = advertisements

    this._eventsPromise = null
    this._administratorsPromise = null
    this._advertisementsPromise = null
  }

  get events(): Promise<Array<Event>>{
    if(!this._eventsPromise){
      this._eventsPromise = new Promise<Array<Event>>(this._loadEvents.bind(this))
    }

    return this._eventsPromise;
  }

  get administrators(): Promise<Array<Account>>{
    if(!this._administratorsPromise){
      this._administratorsPromise = new Promise<Array<Account>>(this._loadAdministrators.bind(this))
    }

    return this._administratorsPromise;
  }

  addAdministrator(account: Account): Promise<Array<Account>>{
    return new Promise<Array<Account>>((resolve,reject)=>{
      (new Promise<Array<Account>>(this._loadAdministrators.bind(this))).then(administrators => {
        let accounts: Array<string> = []
        for(let administrator of administrators){
          accounts.push(administrator.number)
        }

        if(accounts.indexOf(account.number) >= 0){
          resolve(administrators)
        }else{
          console.log(accounts)
          accounts.push(account.number)
          console.log(accounts)
          this._updateAdministrators(accounts).then(administrators => {
            resolve(administrators)
          })
        }
      })
    })
  }

  removeAdministrator(account: Account): Promise<Array<Account>>{
    return new Promise<Array<Account>>((resolve,reject)=>{
      (new Promise<Array<Account>>(this._loadAdministrators.bind(this))).then(administrators => {
        let accounts: Array<string> = []
        for(let administrator of administrators){
          accounts.push(administrator.number)
        }

        if(accounts.indexOf(account.number) < 0){
          resolve(administrators)
        }

        accounts.splice(accounts.indexOf(account.number),1)
        this._updateAdministrators(accounts).then(administrators => {
          resolve(administrators)
        })
      })
    })
  }

  createEvent(event: Event): Promise<Event>{
    event.start = event.start.replace("T", " ")
    event.end = event.end.replace("T", " ")

    return new Promise<Event>((resolve,reject)=>{
      this._httpClient.post(this._events, event, { observe: 'response' })
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

          return of(new HttpResponse<any>());
        })
      )
      .subscribe(response => {
        let event = null;
        if(response.body){
          event = new EventModel(response.body,this._httpClient);
        }

        resolve(event);
      })
    })
  }

  get advertisements(): Promise<Array<Advertisement>>{
    if(!this._advertisementsPromise){
      this._advertisementsPromise = new Promise<Array<Advertisement>>(this._loadAdvertisements.bind(this));
    }

    return this._advertisementsPromise;
  }

  createAdvertisement(advertisement: Advertisement): Promise<Advertisement>{
    for(let time of advertisement.schedule){
      time.start = time.start.replace("T", " ")
      time.end = time.end.replace("T", " ")
    }

    return new Promise<Advertisement>((resolve,reject)=>{
      let payload: any = advertisement;
      payload.event = advertisement.event?advertisement.event.self:"";
      this._httpClient.post(this._advertisements, payload, { observe: 'response' })
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

          return of(new HttpResponse<any>());
        })
      )
      .subscribe(response => {
        let advertisement = null;
        if(response.body){
          advertisement = new AdvertisementModel(response.body,this._httpClient);
        }

        resolve(advertisement);
      })
    })
  }

  private _loadAdministrators(resolve: any,reject: any){
    this._httpClient.get(this._administrators, { observe: 'response' })
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

        return of(new HttpResponse<any>());
      })
    )
    .subscribe(response => {
      let administrators: Array<Account> = [];
      if(response.body && Array.isArray(response.body.administrators)){
        for(let administrator of response.body.administrators){
          administrators.push(new AccountModel(administrator,this._httpClient));
        }
      }

      resolve(administrators);
    })
  }

  private _updateAdministrators(administrators: Array<string>): Promise<Array<Account>>{
    return new Promise<Array<Account>>((resolve,reject)=>{
      let payload: any = {administrators: administrators}
      this._httpClient.put(this._administrators, payload, { observe: 'response' })
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

          return of(new HttpResponse<any>());
        })
      )
      .subscribe(response => {
        let administrators: Array<Account> = [];
        if(response.body && Array.isArray(response.body.administrators)){
          for(let administrator of response.body.administrators){
            administrators.push(new AccountModel(administrator,this._httpClient));
          }
        }

        resolve(administrators);
      })
    })
  }

  private _loadEvents(resolve: any,reject: any){
    this._httpClient.get(this._events, { observe: 'response' })
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

        return of(new HttpResponse<any>());
      })
    )
    .subscribe(response => {
      let events: Array<Event> = [];
      if(response.body && Array.isArray(response.body.entries)){
        for(let entry of response.body.entries){
          events.push(new EventModel(entry,this._httpClient));
        }
      }

      resolve(events);
    })
  }

  private _loadAdvertisements(resolve: any,reject: any){
    this._httpClient.get(this._advertisements, { observe: 'response' })
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

        return of(new HttpResponse<any>());
      })
    )
    .subscribe(response => {
      let advertisements: Array<Advertisement> = [];
      if(response.body && Array.isArray(response.body.entries)){
        for(let entry of response.body.entries){
          advertisements.push(new AdvertisementModel(entry,this._httpClient));
        }
      }

      resolve(advertisements);
    })
  }
}
