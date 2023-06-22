import { NgModule, ModuleWithProviders } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { ConfigService } from './services/config.service';
import { StorageService } from './services/storage.service';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { RequestInterceptor } from './interceptors/request.interceptor';
import { Config } from './interface/config.interface';

const HttpInterceptorProviders = [
  {provide: HTTP_INTERCEPTORS, useClass: RequestInterceptor, multi: true}
]


@NgModule({
  imports: [
    HttpClientModule
  ],
  providers:[
    StorageService,
    HttpInterceptorProviders
  ]
})
export class TickeTingModule{
  static forRoot(config: Config): ModuleWithProviders<TickeTingModule>{
    return {
      ngModule: TickeTingModule,
      providers:[
        {
          provide: ConfigService,
          useValue: config
        }
      ]
    }
  }
}
