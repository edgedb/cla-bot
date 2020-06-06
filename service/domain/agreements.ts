export class AgreementListItem {
  id: string | null;
  name: string;
  description?: string;
  creationTime?: Date;

  constructor(
    id: string | null,
    name: string,
    description?: string,
    creationTime?: Date
  ) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.creationTime = creationTime;
  }
}

export class AgreementVersion {
  id: string;
  agreementId?: string;
  current: boolean;
  draft: boolean;
  texts?: AgreementText[];
  creationTime: Date;

  constructor(
    id: string,
    current: boolean,
    draft: boolean,
    agreementId: string | undefined,
    creationTime: Date,
    texts?: AgreementText[]
  ) {
    this.id = id;
    this.current = current;
    this.draft = draft;
    this.texts = texts;
    this.agreementId = agreementId;
    this.creationTime = creationTime;
  }
}

export class AgreementText {
  id: string;
  title: string;
  text: string;
  culture: string;
  versionId: string;
  updateTime: Date;
  creationTime: Date;

  constructor(
    id: string,
    title: string,
    text: string,
    culture: string,
    versionId: string,
    updateTime: Date,
    creationTime: Date
  ) {
    this.id = id;
    this.text = text;
    this.title = title;
    this.culture = culture;
    this.versionId = versionId;
    this.updateTime = updateTime;
    this.creationTime = creationTime;
  }
}

export interface AgreementTextInput {
  title: string;
  text: string;
  culture: string;
}

/**
 * Basic information about a configured agreement for a repository.
 */
export class RepositoryAgreementInfo {
  versionId: string;

  constructor(versionId: string) {
    this.versionId = versionId;
  }
}

export class Agreement extends AgreementListItem {
  versions: AgreementVersion[];

  constructor(
    id: string,
    name: string,
    description: string,
    creationTime: Date,
    versions: AgreementVersion[]
  ) {
    super(id, name, description, creationTime);
    this.versions = versions;
  }
}

export interface AgreementsRepository {
  getAgreements(): Promise<AgreementListItem[]>;

  getAgreement(agreementId: string): Promise<Agreement | null>;

  getAgreementVersion(versionId: string): Promise<AgreementVersion | null>;

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

  updateAgreement(
    id: string,
    name: string,
    description: string
  ): Promise<void>;

  updateAgreementText(id: string, title: string, body: string): Promise<void>;

  updateAgreementVersion(id: string, draft: boolean): Promise<void>;

  createAgreementVersion(
    agreementId: string,
    texts: AgreementTextInput[]
  ): Promise<AgreementVersion>;

  setCurrentAgreementVersion(
    agreementId: string,
    versionId: string
  ): Promise<void>;
}
