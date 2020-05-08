export class License {
  id: string | null
  email: string
  signed_at: Date

  constructor(id: string | null, email: string, signed_at: Date) {
    this.id = id;
    this.email = email
    this.signed_at = signed_at
  }
}


export class LicenseText {
  id: string | null
  text: string
  culture: string
}


export interface LicensesRepository {

  getLicenses(): Promise<License[]>;

  getLicenseText(licenseId: string, cultureCode: string): Promise<LicenseText>;
}
