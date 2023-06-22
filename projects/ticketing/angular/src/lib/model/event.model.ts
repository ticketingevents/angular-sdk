import { ContentModel } from '../model/content.model';
import { Category } from '../interface/category.interface';
import { Venue } from '../interface/venue.interface';
import { Event } from '../interface/event.interface';
import { Section } from '../interface/section.interface';
import { SectionModel } from '../model/section.model';

import * as constants from '../constants';

import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { HttpClient, HttpResponse, HttpErrorResponse, HttpParams } from '@angular/common/http';

export class EventModel extends ContentModel implements Event{
  public type: string;
  public title: string;
  public description: string;
  public category: Category;
  public subcategory: string;
  public venue: Venue;
  public start: string;
  public end: string;
  public public: boolean;
  public status?: string;
  public banner?: string;
  public thumbnail?: string;
  public disclaimer?: string;
  public tags?: Array<string>;
  public popularity?: 0

  private _sections: Array<Section>;
  private _showings: string;
  private _showingsPromise: Promise<Array<Event>>;

  constructor(event: any, httpClient: HttpClient){
    let sections = event.sections
    let showings = event.showings
    delete event.sections
    delete event.showings

    super(event, httpClient)

    this._sections = [];
    if(Array.isArray(sections)){
      for(let section of sections){
        this._sections.push(new SectionModel(section, httpClient));
      }
    }

    this._showings = showings

    this._showingsPromise = null
  }

  get sections(): Array<Section>{
    return this._sections;
  }

  get showings(): Promise<Array<Event>>{
    if(!this._showingsPromise){
      this._showingsPromise = new Promise<Array<Event>>(this._loadShowings.bind(this))
    }

    return this._showingsPromise;
  }

  get sales(): Promise<any>{
    return new Promise<any>((resolve, reject) => {
      this._httpClient.get(this._self+"/sales", { observe: 'response' })
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
        let summary = {}
        if(response.body){
          summary = response.body
        }

        resolve(summary)
      })
    })
  }

	reload(): Promise<any>{
		let params = new HttpParams()
		params = params.set("cache", "nocache")

		return new Promise<any>((resolve, reject) => {
			this._httpClient.get(this._self, { observe: 'response', params: params })
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
				let eventData = response.body

		    let sections = eventData.sections
		    let showings = eventData.showings

				delete eventData.self
		    delete eventData.sections
		    delete eventData.showings

				Object.assign(this, eventData)

		    this._sections.length = 0;
		    if(Array.isArray(sections)){
		      for(let section of sections){
		        this._sections.push(new SectionModel(section, this._httpClient));
		      }
		    }

		    this._showings = showings
				resolve(true)
	    })
		})
  }

  save(): Promise<boolean>{
    this.start = this.start.replace("T", " ")
    this.end = this.end.replace("T", " ")

    return super.save()
  }

  addSection(section: Section): Promise<Section>{
    section.salesStart = section.salesStart.replace("T", " ")
    section.salesEnd = section.salesEnd.replace("T", " ")

    return new Promise<Section>((resolve,reject)=>{
      this._httpClient.post(this._self+"/sections", section, { observe: 'response' })
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
        let section = null;
        if(response.body){
          section = new SectionModel(response.body, this._httpClient)
          this.sections.push(section);
        }

        resolve(section);
      })
    })
  }

  addShowing(showing: Event): Promise<Event>{
    return new Promise<Event>((resolve,reject)=>{
      this._httpClient.post(this._showings, showing, { observe: 'response' })
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
        let showing = null;
        if(response.body){
          showing = new EventModel(response.body,this._httpClient);
        }

        resolve(showing);
      })
    })
  }

  submit(): Promise<boolean>{
    return new Promise<boolean>((resolve,reject)=>{
      this._httpClient.post(this._self+"/submissions", {}, { observe: 'response' })
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

  publish(): Promise<boolean>{
    return new Promise<boolean>((resolve,reject)=>{
      this._httpClient.post(this._self+"/publications", {}, { observe: 'response' })
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

  private _loadShowings(resolve: any,reject: any){
    this._httpClient.get(this._showings, { observe: 'response' })
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
      let showings: Array<Event> = [];
      if(response.body && Object.keys(response.body.entries).length){
        for(let entry of response.body.entries){
          showings.push(new EventModel(entry,this._httpClient));
        }
      }

      resolve(showings);
    })
  }
}
