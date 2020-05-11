
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
  title: string
  text: string
  culture: string

  constructor(
    id: string,
    title: string,
    text: string,
    culture: string
  ) {
    this.id = id
    this.text = text
    this.title = title
    this.culture = culture
  }
}


/**
 * Basic information about a configured license for a repository.
 */
export class RepositoryLicenseInfo {
  versionId: string
  versionNumber: string

  constructor(versionId: string, versionNumber: string) {
    this.versionId = versionId
    this.versionNumber = versionNumber
  }
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

  getLicenseText(versionId: string, cultureCode: string): Promise<LicenseText | null>;

  getCurrentLicenseVersionForRepository(
    fullRepositoryName: string
  ): Promise<RepositoryLicenseInfo | null>;
}
