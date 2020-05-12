

export interface ClaCheckRepository {
  id: number,
  owner: string,
  ownerId: number,
  name: string,
  fullName: string
}

export interface ClaCheckPullRequest {
  id: number
  number: number
  headSha: string
  url: string
}

export interface ClaCheckInput {
  gitHubUserId: number
  committers: string[] | null
  licenseVersionId: string | null
  repository: ClaCheckRepository
  pullRequest: ClaCheckPullRequest
}

export interface CLACheckState extends ClaCheckInput {
  commentId: string
}

export class ContributorLicenseAgreement {
  id: string | null
  email: string
  versionId: string
  signed_at: Date

  constructor(
    id: string | null,
    email: string,
    licenseVersionId: string,
    signed_at: Date
  ) {
    this.id = id;
    this.email = email
    this.versionId = licenseVersionId
    this.signed_at = signed_at
  }
}

export interface ClaRepository {

  getClaByEmailAddress(email: string): Promise<ContributorLicenseAgreement | null>;

  saveCla(data: ContributorLicenseAgreement): Promise<void>;
}
