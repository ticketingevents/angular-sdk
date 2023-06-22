export interface Content{
  self?: string;
  id?: string;
  save?(): Promise<boolean>;
  delete?(): Promise<boolean>;
}
