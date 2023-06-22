export interface Digest{
  validate?(code: string): {serial: string, status: string};
}
