
export class Agreement {
  id: string | null
  name: string
  description?: string
  creationTime?: Date

  constructor(
    id: string | null,
    name: string,
    description?: string,
    creationTime?: Date
    ) {
    this.id = id
    this.name = name
    this.description = description
    this.creationTime = creationTime
  }
}

export class AgreementVersion {
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
export class RepositoryAgreementInfo {
  versionId: string
  versionNumber: string

  constructor(versionId: string, versionNumber: string) {
    this.versionId = versionId
    this.versionNumber = versionNumber
  }
}


export class AgreementDetail extends Agreement {
  versions: AgreementVersion[]

  constructor(
    id: string,
    name: string,
    description: string,
    versions: AgreementVersion[]
  ) {
    super(id, name, description)
    this.versions = versions
  }
}


export interface AgreementsRepository {

  getAgreements(): Promise<Agreement[]>;

  getAgreementTextForRepository(
    repositoryFullName: string,
    cultureCode: string
  ): Promise<AgreementText | null>;

  getAgreementText(
    versionId: string,
    cultureCode: string
  ): Promise<AgreementText | null>;

  createAgreement(
    name: string,
    description?: string
  ): Promise<Agreement>;

  getCurrentAgreementVersionForRepository(
    fullRepositoryName: string
  ): Promise<RepositoryAgreementInfo | null>;
}
