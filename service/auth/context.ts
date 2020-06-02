

export class Claim {
  name: string
  value: any
}


export class ClaimsIdentity {
  private _claims: Claim[]

  public get claims(): Claim[] {
    return this._claims;
  }

  constructor(claims: Claim[]) {
    this._claims = claims
  }
}


export interface AuthContext {
  user: object
}
