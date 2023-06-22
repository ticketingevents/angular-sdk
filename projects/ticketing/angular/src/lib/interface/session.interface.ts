import { Account } from './account.interface';

export interface Session{
  id?: string;
  started: string;
  open: boolean;
  key: string;
  account: Account;
  ip?: string;
  agent?: string;
  end?(): Promise<boolean>;
}
