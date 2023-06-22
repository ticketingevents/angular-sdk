export interface Reset{
  status: string;
  confirm?(code: string): Promise<boolean>;
}
