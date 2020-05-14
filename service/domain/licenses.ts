
export class Agreement {
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
  texts: AgreementText[]

  constructor(
    id: string | null,
    current: boolean,
    draft: boolean,
    texts: AgreementText[]
  ) {
    this.id = id
    this.current = current
    this.draft = draft
    this.texts = texts
  }
}


export class AgreementText {
  title: string
  text: string
  culture: string
  versionId: string

  constructor(
    title: string,
    text: string,
    culture: string,
    versionId: string
  ) {
    this.text = text
    this.title = title
    this.culture = culture
    this.versionId = versionId
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


export class LicenseDetail extends Agreement {
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

  getLicenses(): Promise<Agreement[]>;

  getAgreementTextForRepository(
    repositoryFullName: string,
    cultureCode: string
  ): Promise<AgreementText | null>;

  getLicenseText(
    versionId: string,
    cultureCode: string
  ): Promise<AgreementText | null>;

  getCurrentLicenseVersionForRepository(
    fullRepositoryName: string
  ): Promise<RepositoryLicenseInfo | null>;
}
