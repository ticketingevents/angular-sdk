import { Injectable } from '@angular/core';

import { AccountService } from './services/account.service';
import { AdvertisementService } from './services/advertisement.service';
import { EventService } from './services/event.service';
import { HostService } from './services/host.service';
import { SessionService } from './services/session.service';
import { SystemService } from './services/system.service';

@Injectable({
  providedIn: 'root'
})
export class TickeTing{
  public account: AccountService;
  public advertisement: AdvertisementService;
  public event: EventService;
  public host: HostService;
  public session: SessionService;
  public system: SystemService;

  constructor(_accountService: AccountService, _advertisementService: AdvertisementService,
              _sessionService: SessionService, _hostService: HostService,
              _eventService: EventService, _systemService: SystemService){
    this.account = _accountService;
    this.advertisement = _advertisementService;
    this.event = _eventService;
    this.host = _hostService;
    this.session = _sessionService;
    this.system = _systemService;
  }
}
