

export interface ClaCheckRepository {
  id: number,
  owner: string,
  ownerId: number,
  name: string,
  fullName: string
}

export interface ClaCheckPullRequest {
  number: number
  headSha: string
  url: string
}

export interface ClaCheckInput {
  action: string
  gitHubUserId: number
  repository: ClaCheckRepository
  pullRequest: ClaCheckPullRequest
}

export interface ClaCheckState extends ClaCheckInput {
  commentId: string
}

export class Cla {
  id: string
  email: string
  timestamp: Date

  constructor(id: string, email: string, timestamp: Date) {
    this.id = id;
    this.email = email
    this.timestamp = timestamp
  }
}

export interface ClaRepository {

  getClaByEmailAddress(email: string): Promise<Cla | null>;

  saveCla(data: Cla): Promise<void>;
}
