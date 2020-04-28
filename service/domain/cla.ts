
export class CLA {
  id: string;
  gitHubUserId: Number;
  timestamp: Date

  constructor(id: string, gitHubUserId: Number, timestamp: Date) {
    this.id = id;
    this.gitHubUserId = gitHubUserId
    this.timestamp = timestamp
  }
}

export interface ClaRepository {

  getClaByGitHubUserId(githubUserId: Number): Promise<CLA | null>;

  saveCla(data: CLA): Promise<void>;
}
