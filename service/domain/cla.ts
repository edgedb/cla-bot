

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
  repository: ClaCheckRepository
  pullRequest: ClaCheckPullRequest
}

export interface ClaCheckState extends ClaCheckInput {
  commentId: string
}

export class Cla {
  id: string | null
  email: string
  signed_at: Date

  constructor(id: string | null, email: string, timestamp: Date) {
    this.id = id;
    this.email = email
    this.signed_at = timestamp
  }
}

export interface ClaRepository {

  getClaByEmailAddress(email: string): Promise<Cla | null>;

  saveCla(data: Cla): Promise<void>;
}
