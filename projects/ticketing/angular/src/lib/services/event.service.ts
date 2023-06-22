import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse, HttpErrorResponse, HttpParams } from '@angular/common/http';

import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import * as constants from '../constants';

import { Account } from '../interface/account.interface'
import { Event } from '../interface/event.interface'
import { EventModel } from '../model/event.model'

import { SectionService } from '../services/section.service'
import { ModifierService } from '../services/modifier.service'
import { VenueService } from '../services/venue.service'
import { CategoryService } from '../services/category.service'

@Injectable({
  providedIn: 'root'
})
export class EventService{
  public section: SectionService;
  public modifier: ModifierService;
  public venue: VenueService;
  public category: CategoryService;

  constructor(private _http: HttpClient, _venueService: VenueService,
              _categoryService: CategoryService,
              _sectionService: SectionService,
              _modifierService: ModifierService){
    this.section = _sectionService;
    this.modifier = _modifierService;
    this.venue = _venueService;
    this.category = _categoryService;
  }

  submissions(): Promise<Array<Event>>{
    return new Promise<Array<Event>>((resolve,reject)=>{
      this._http.get("/submissions", { observe: 'response' })
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
        let events: Array<Event> = [];
        if(response.body && Object.keys(response.body.entries).length){
          for(let entry of response.body.entries){
            events.push(new EventModel(entry,this._http));
          }
        }

        resolve(events);
      })
    })
  }

  attending(account: Account): Promise<Array<Event>>{
    return new Promise<Array<Event>>((resolve,reject)=>{
      this._http.get("/accounts/"+account.number+"/attending", { observe: 'response' })
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
        let events: Array<Event> = [];
        if(response.body && Object.keys(response.body.entries).length){
          for(let entry of response.body.entries){
            events.push(new EventModel(entry,this._http));
          }
        }

        resolve(events);
      })
    })
  }

  upcoming(results: number = 10, page: number = 1): Promise<Array<Event>>{
    return this._list("upcoming","asc","",results,page);
  }

  popular(results: number = 10, page: number = 1): Promise<Array<Event>>{
    return this._list("popularity","desc","",results,page);
  }

  new(results: number = 10, page: number = 1): Promise<Array<Event>>{
    return this._list("published","desc","",results,page);
  }

  search(title: string, results: number = 10, page: number = 1): Promise<Array<Event>>{
    return this._list("alphabetical","asc",title,results,page);
  }

  retrieve(self: string): Promise<Event>{
    return new Promise<Event>((resolve, reject) => {
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
        let event = null;
        if(response.body){
          event = new EventModel(<Event>response.body, this._http);
        }

        resolve(event);
      })
    })
  }

  private _list(sort: string = "", order: string = "", title: string = "", results: number = 10, page: number = 1): Promise<Array<Event>>{
    return new Promise<Array<Event>>((resolve,reject)=>{
      let params = new HttpParams();
      if(sort){
        params = params.set("sort",sort)
      }

      if(order){
        params = params.set("order",order)
      }

      if(title){
        params = params.set("title",title)
      }

      params = params.set("page",page.toString())
      params = params.set("records",results.toString())

      this._http.get("/events", { observe: 'response', params: params })
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
        let events: Array<Event> = [];
        if(response.body && Object.keys(response.body.entries).length){
          for(let entry of response.body.entries){
            events.push(new EventModel(entry,this._http));
          }
        }

        resolve(events);
      })
    })
  }
}
