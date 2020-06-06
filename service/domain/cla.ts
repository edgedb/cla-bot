export interface ClaCheckRepository {
  id: number;
  owner: string;
  ownerId: number;
  name: string;
  fullName: string;
}

export interface ClaCheckPullRequest {
  id: number;
  number: number;
  headSha: string;
  url: string;
}

export interface ClaCheckInput {
  gitHubUserId: number;
  committers: string[] | null;
  agreementVersionId: string | null;
  repository: ClaCheckRepository;
  pullRequest: ClaCheckPullRequest;
}

export interface ClaCheckState extends ClaCheckInput {
  commentId: string;
}

export class ContributorLicenseAgreement {
  id: string | null;
  email: string;
  versionId: string;
  signedAt: Date;

  constructor(
    id: string | null,
    email: string,
    versionId: string,
    signedAt: Date
  ) {
    this.id = id;
    this.email = email;
    this.versionId = versionId;
    this.signedAt = signedAt;
  }
}

export interface ClaRepository {
  getClaByEmailAddress(
    email: string
  ): Promise<ContributorLicenseAgreement | null>;

  saveCla(data: ContributorLicenseAgreement): Promise<void>;
}
