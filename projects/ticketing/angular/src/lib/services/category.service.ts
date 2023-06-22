import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse, HttpErrorResponse } from '@angular/common/http';

import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import * as constants from '../constants';

import { Category } from '../interface/category.interface';
import { CategoryModel } from '../model/category.model';

@Injectable({
  providedIn: 'root'
})
export class CategoryService{
  constructor(private _http: HttpClient){}

  list(): Promise<Array<Category>>{
    return new Promise<Array<Category>>((resolve,reject)=>{
      this._http.get("/categories", { observe: 'response' })
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
        let categories: Array<Category> = [];
        if(response.body && Array.isArray(response.body.entries)){
          for(let entry of response.body.entries){
            categories.push(new CategoryModel(entry,this._http));
          }
        }

        resolve(categories);
      })
    })
  }

  create(category: Category): Promise<Category>{
    return new Promise<Category>((resolve, reject) => {
      this._http.post("/categories", category, { observe: 'response' })
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
        let category = null;
        if(response.body){
          category = new CategoryModel(<Category>response.body, this._http);
        }

        resolve(category);
      })
    })
  }

  retrieve(self: string): Promise<Category>{
    return new Promise<Category>((resolve, reject) => {
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
        let category = null;
        if(response.body){
          category = new CategoryModel(<Category>response.body, this._http);
        }

        resolve(category);
      })
    })
  }
}
