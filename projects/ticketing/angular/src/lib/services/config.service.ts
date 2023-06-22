import { InjectionToken } from '@angular/core';
import { Config } from '../interface/config.interface';

export const ConfigService = new InjectionToken<Config>("Config");
