

export interface ClaCheckRepository {
  id: number,
  owner: string,
  ownerId: number,
  name: string,
  fullName: string
}

export interface ClaCheckInput {
  gitHubUserId: number
  repository: ClaCheckRepository
  pullRequestHeadSha: string
}

export class Cla {
  id: string;
  gitHubUserId: number;
  timestamp: Date

  constructor(id: string, gitHubUserId: number, timestamp: Date) {
    this.id = id;
    this.gitHubUserId = gitHubUserId
    this.timestamp = timestamp
  }
}

export interface ClaRepository {

  getClaByGitHubUserId(githubUserId: number): Promise<Cla | null>;

  saveCla(data: Cla): Promise<void>;
}
