import { Injectable, Inject } from '@angular/core';
import { HttpEvent, HttpHandler, HttpRequest, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';

import { HttpHeaders } from '@angular/common/http';
import { Config } from '../interface/config.interface';
import { ConfigService } from '../services/config.service';
import { StorageService } from '../services/storage.service';
import { VERSION } from '../constants';

@Injectable()
export class RequestInterceptor implements HttpInterceptor{
  private _apiRoot: string;

  constructor(private _storageService: StorageService, @Inject(ConfigService) config: Config){
    switch(config.environment){
      case "dev":
        this._apiRoot = "http://localhost/ticketing/api/v2";
        break;
      case "qa":
        this._apiRoot = "https://qa.ticketingevents.com/api";
        break;
      case "prod":
        this._apiRoot = "https://api.ticketingevents.com/v2";
        break;
    }
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>>{
    let request = {
      url: "",
      headers: new HttpHeaders()
    }

    if(req.url.match(/^http(s)?:\/\//)){
      request.url = req.url;
    }else{
      request.url = this._apiRoot + req.url

      let apiKey = this._storageService.retrieve("apiKey");
      if(apiKey){
        request["headers"] = request["headers"].set('X-API-Key', apiKey)
      }

      if(VERSION){
        request["headers"] = request["headers"].set('X-Client-Version', VERSION)
      }
    }

    req = req.clone(request);

    return next.handle(req)
  }
}
