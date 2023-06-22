import { ActivitySummary } from './activity-summary.interface';
import { Order } from './order.interface';
import { Section } from './section.interface';
import { Ticket } from './ticket.interface';
import { Transfer } from './transfer.interface';

export interface Account{
  username: string;
  email: string;
  number?: string;
  role?: string;
  verified?: boolean;
  activated?: boolean;
  title?: string;
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  phone?: string;
  firstAddressLine?: string;
  secondAddressLine?: string;
  city?: string;
  state?: string;
  country?: string;

  verify?(code: string): Promise<boolean>;
  resendVerification?(): Promise<boolean>;
  activate?(reason: string): Promise<boolean>;
  deactivate?(reason: string): Promise<boolean>;
  startOrder?(): Order;
  startTransfer?(): Transfer;
  listWallet?(section: Section): Promise<Array<Ticket>>;
  listPendingTransferRequests?(): Promise<Array<Transfer>>;
  listPendingTransfersSent?(): Promise<Array<Transfer>>;
  getActivity?(): Promise<ActivitySummary>
}
