import { ContentModel } from './content.model';
import { Advertisement } from '../interface/advertisement.interface';
import { Event } from '../interface/event.interface';
import { TimeSlot } from '../interface/time-slot.interface';
import { Zone } from '../interface/zone.interface';
import { EventModel } from '../model/event.model';

import * as constants from '../constants';

import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { HttpClient, HttpResponse, HttpErrorResponse } from '@angular/common/http';

export class AdvertisementModel extends ContentModel implements Advertisement{
  public name: string;
  public description: string;
  public artwork: string;
  public zones: Array<Zone>;
  public schedule: Array<TimeSlot>;
  public status?: string;
  public event?: Event;

  constructor(advertisement: any, httpClient: HttpClient){
    let event = null
    if(advertisement.event){
      event = new EventModel(advertisement.event,httpClient)
    }
    delete advertisement.event

    super(advertisement, httpClient)

    this.event = event
  }

  save(): Promise<boolean>{
    for(let time of this.schedule){
      time.start = time.start.replace("T", " ")
      time.end = time.end.replace("T", " ")
    }

    return super.save()
  }

  submit(): Promise<boolean>{
    if(this.status == "Draft"){
      return new Promise((resolve,reject)=>{
        this._action("submission").then(result => {
          if(result){
            this.status = "Under Review";
          }

          resolve(result)
        })
      })
    }
  }

  approve(): Promise<boolean>{
    if(this.status == "Under Review"){
      return new Promise((resolve,reject)=>{
        this._action("approval").then(result => {
          if(result){
            this.status = "Running";
          }

          resolve(result)
        })
      })
    }
  }

  deny(): Promise<boolean>{
    console.log(this.status)
    if(this.status == "Under Review"){
      return new Promise((resolve,reject)=>{
        this._action("denial").then(result => {
          if(result){
            this.status = "Draft";
          }

          resolve(result)
        })
      })
    }
  }

  private _action(action: string): Promise<boolean>{
    return new Promise<boolean>((resolve,reject)=>{
      this._httpClient.post(this._self+"/"+action+"s", {}, { observe: 'response' })
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
