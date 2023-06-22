import { Injectable } from '@angular/core';

@Injectable()
export class StorageService{
  private _keyStore: any;

  constructor(){
    this._keyStore = {};
  }

  store(key: string, value: any){
    this._keyStore[key] = value;
  }

  retrieve(key: string): any{
    if(Object.keys(this._keyStore).indexOf(key) >= 0){
      return this._keyStore[key];
    }else{
      return null;
    }
  }

  delete(key: string): boolean{
    if(Object.keys(this._keyStore).indexOf(key) >= 0){
      delete this._keyStore[key];
      return true;
    }else{
      return false;
    }
  }
}
