import { Content } from './content.interface'
import { Event } from './event.interface';
import { TimeSlot } from './time-slot.interface';
import { Zone } from './zone.interface';

export interface Advertisement extends Content{
  name: string;
  description: string;
  artwork: string;
  zones: Array<Zone>;
  schedule: Array<TimeSlot>;
  status?: string;
  event?: Event;
  submit?(): Promise<boolean>;
  approve?(): Promise<boolean>;
  deny?(): Promise<boolean>;
}
