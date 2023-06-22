import { Order } from '../interface/order.interface';
import { Event } from '../interface/event.interface';
import { Section } from '../interface/section.interface';
import { Modifier } from '../interface/modifier.interface';
import { BillingInformation } from '../interface/billing.interface';

import * as constants from '../constants';

import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { HttpClient, HttpResponse, HttpErrorResponse } from '@angular/common/http';

export class OrderModel implements Order{
  public number: string;
  public items: Array<{event: Event, section: Section, modifier: Modifier, quantity: number, unitPrice: number}>;

  private _self: string;
  private _status: string;
  private _placed: string;
  private _httpClient: HttpClient;
  private _account: string;
  private _timeLeft: {minutes: number, seconds: number}
  private _timeLimit: number;

  constructor(order: any, account: string, httpClient: HttpClient){
    this._self = order.self;
    this._status = order.status;
    this._placed = order.placed;
    this._account = account;
    this._timeLimit = 15;

    delete order.self;
    delete order.status;
    delete order.placed;

    Object.assign(this,order)

    this._httpClient = httpClient;

    //Determine time left to complete order
    if(this._status == "Placed"){
      this._startTimer()
    }else{
      this._timeLeft = {
        minutes:0,
        seconds:0
      }
    }
  }

  get status(): string{
    return this._status;
  }

  get placed(): Date{
    return this._placed?new Date(Date.parse(this._placed)):null;
  }

  get convenienceFees(): number{
    let convenienceFees: number = 0;
    let unitFee: number = 0;

    for(let item of this.items){
      if(item.unitPrice <= 50){
        unitFee = 0.99;
      }else if(item.unitPrice <= 100){
        unitFee = 1.99;
      }else if(item.unitPrice <= 150){
        unitFee = 2.99;
      }else if(item.unitPrice <= 200){
        unitFee = 3.99;
      }else{
        unitFee = 4.99;
      }

      convenienceFees += item.quantity * unitFee;
    }

    return convenienceFees;
  }

  get total(): number{
    let total = 0;
    for(let item of this.items){
      total += item.unitPrice * item.quantity;
    }

    return total;
  }

  get timeLeft(): {minutes: number, seconds: number}{
    return this._timeLeft;
  }

  public addItem(section: Section, quantity: number): Promise<boolean>{
    return new Promise<boolean>((resolve, reject) => {
      if(this.status == "Opened"){
        section.getCurrentPrice(quantity).then(price => {
          let exists = false;
          for(let item of this.items){
            if(item.section.self == section.self){
              exists = true;
              item.modifier = price.modifier
              item.quantity = quantity
              item.unitPrice = price.amount
              break;
            }
          }

          if(!exists){
            this.items.push({
              event: null,
              section: section,
              modifier: price.modifier,
              quantity: quantity,
              unitPrice: price.amount
            })
          }

          resolve(true)
        })
      }else{
        resolve(false)
      }
    })
  }

  public place(): Promise<boolean>{
    return new Promise<boolean>((resolve,reject)=>{
      if(this.status !== "Opened" || this.items.length == 0){
        reject(constants.INVALID_STATE)
        return;
      }

      let payload = {
        "items":{}
      }

      for(let item of this.items){
        payload["items"][item.section.self] = parseInt(item.quantity.toString());
      }

      this._httpClient.post("/accounts/"+this._account+"/orders", payload, { observe: 'response' })
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
        if(response.body){
          this.number = response.body.number;
          this._self = response.body.self;
          this._placed = response.body.placed;
          this._status = response.body.status;

          let itemEvents = {};
          for(let item of response.body.items){
            itemEvents[item.section.self.match(/([0-9]+)$/g)] = item.event;
          }

          for(let item of this.items){
            item.event = itemEvents[item.section.id];
          }

          if(this._status == "Placed"){
            this._timeLeft = {
              minutes:this._timeLimit,
              seconds:0
            }

            this._startTimer()
          }

          resolve(true);
        }else{
          resolve(false);
        }
      })
    })
  }

  public cancel(): Promise<boolean>{
    return new Promise<boolean>((resolve,reject)=>{
      if(this.status !== "Placed"){
        reject(constants.INVALID_STATE)
        return;
      }

      this._httpClient.post(this._self+"/cancellations", {}, { observe: 'response' })
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
        if(response.body){
          this._status = "Cancelled";
          resolve(response.body.success);
        }else{
          resolve(false)
        }
      })
    })
  }

  public pay(billingInformation: BillingInformation): Promise<boolean>{
    return new Promise<boolean>((resolve,reject)=>{
      if(this.status !== "Placed"){
        reject(constants.INVALID_STATE)
        return;
      }

      this._httpClient.post(this._self+"/payments", billingInformation, { observe: 'response' })
      .pipe(
        catchError((error: HttpErrorResponse) => {
          switch(error.status){
            case 400:
              reject(constants.INVALID_VALUES)
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
        if(response.body.success){
          this._status = "Fulfilled";
        }

        resolve(response.body.success);
      })
    })
  }

  public syncTime(): Promise<boolean>{
    return new Promise<boolean>((resolve,reject)=>{
      let timeLimit = this._timeLimit*60000;
      this._httpClient.get("/time?client="+new Date().getTime(), { observe: 'response' })
      .subscribe((response: any) => {
        let utc = 0
        if(response.body && response.body.utc){
          utc = response.body.utc * 1000
        }

        let timeLeft = Math.max(0,(timeLimit - (utc - this.placed.getTime()))/1000);

        this._timeLeft = {
          minutes: Math.floor(timeLeft/60),
          seconds: Math.floor(timeLeft%60)
        }

        resolve(true)
      })
    })
  }

  private _startTimer(){
    this.syncTime().then(result => {
      this._countdown()
    })
  }

  private _countdown(){
    if(this._timeLeft.minutes > 0 || this._timeLeft.seconds > 0){
      if(this._timeLeft.seconds > 0){
        this._timeLeft.seconds -= 1
      }else{
        this._timeLeft.minutes -= 1
        this._timeLeft.seconds = 59
      }

      setTimeout(() => {
        this._countdown()
      }, 1000);
    }
  }
}
