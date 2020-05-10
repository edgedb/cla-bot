
export class License {
  id: string | null
  name: string
  description: string

  constructor(id: string | null, name: string, description: string) {
    this.id = id
    this.name = name
    this.description = description
  }
}

export class LicenseVersion {
  id: string | null
  current: boolean
  draft: boolean
  texts: LicenseText[]

  constructor(
    id: string | null,
    current: boolean,
    draft: boolean,
    texts: LicenseText[]
  ) {
    this.id = id
    this.current = current
    this.draft = draft
    this.texts = texts
  }
}

export class LicenseText {
  id: string | null
  text: string
  culture: string
}


export class LicenseDetail extends License {
  versions: LicenseVersion[]

  constructor(
    id: string,
    name: string,
    description: string,
    versions: LicenseVersion[]
  ) {
    super(id, name, description)
    this.versions = versions
  }
}


export interface LicensesRepository {

  getLicenses(): Promise<License[]>;

  // getLicenseDetails(): Promise<LicenseDetail>;

  getLicenseText(licenseId: string, cultureCode: string): Promise<LicenseText>;

  getLicenseForRepository(
    fullRepositoryName: string,
    cultureCode: string
  ) : Promise<string | null>;
}
