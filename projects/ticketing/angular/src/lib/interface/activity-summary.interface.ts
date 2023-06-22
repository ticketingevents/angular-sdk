import { Account } from './account.interface';
import { Session } from './session.interface';

export interface ActivitySummary{
  account: Account

  orders: Array<{
    number: string,
    total: number,
    placed: string,
    items: Array<{price: number, quantity: number, event: string, section: string}>
  }>

  tickets: Array<{
    issued: string,
    serial: string,
    status: string,
    event: string,
    section: string
  }>

  transfers:{
    outgoing: Array<{
      sent: string,
      recipient: Account,
      tickets: Array<{event: string, section: string, quantity: number}>,
      status: string
    }>,
    incoming: Array<{
      sent: string,
      sender: Account,
      tickets: Array<{event: string, section: string, quantity: number}>,
      status: string
    }>
  }

  sessions: Array<Session>
}
