import { Digest } from '../interface/digest.interface';

import * as CryptoJS from 'crypto-js'

export class DigestModel implements Digest{
  private _hashMap: {[key: string]: {serial: string, status: string}}

  constructor(digest: {[key: string]: Array<{serial: string, owner: string}>}){
    this._hashMap = {}

    for(let status of Object.keys(digest)){
      if(Array.isArray(digest[status])){
        for(let ticket of digest[status]){
          let fingerprint = CryptoJS.SHA256(
            `${ticket.serial};${ticket.owner}`
          ).toString(CryptoJS.enc.Hex)

          this._hashMap[fingerprint] = {serial: ticket.serial, status: status}
        }
      }
    }
  }

  validate?(code: string): {serial: string, status: string}{
    let result = null

    let fingerprint = code.split(":")[0]
    if(Object.keys(this._hashMap).indexOf(fingerprint) >= 0){
      result = this._hashMap[fingerprint]
    }

    return result
  }
}
