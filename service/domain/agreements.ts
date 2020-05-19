

export function getDefaultVersionNumber(): string {
  const dateTimeFormat = new Intl.DateTimeFormat('en', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
  const [
    { value: month },,
    { value: day },,
    { value: year },,
    { value: hour },,
    { value: minute },,
    { value: second }
  ] = dateTimeFormat .formatToParts(new Date())

  return(`${year}-${month}-${day}-${hour}-${minute}-${second}`)
}


export class AgreementListItem {
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
  id: string
  number: string
  current: boolean
  texts: AgreementText[]
  creationTime: Date

  constructor(
    id: string,
    number: string,
    current: boolean,
    creationTime: Date,
    texts: AgreementText[]
  ) {
    this.id = id
    this.number = number
    this.current = current
    this.texts = texts
    this.creationTime = creationTime
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
 * Basic information about a configured agreement for a repository.
 */
export class RepositoryAgreementInfo {
  versionId: string
  versionNumber: string

  constructor(versionId: string, versionNumber: string) {
    this.versionId = versionId
    this.versionNumber = versionNumber
  }
}


export class Agreement extends AgreementListItem {
  versions: AgreementVersion[]

  constructor(
    id: string,
    name: string,
    description: string,
    creationTime: Date,
    versions: AgreementVersion[]
  ) {
    super(id, name, description, creationTime)
    this.versions = versions
  }
}


export interface AgreementsRepository {

  getAgreements(): Promise<AgreementListItem[]>;

  getAgreement(agreementId: string): Promise<Agreement | null>;

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
  ): Promise<AgreementListItem>;

  getCurrentAgreementVersionForRepository(
    fullRepositoryName: string
  ): Promise<RepositoryAgreementInfo | null>;
}
