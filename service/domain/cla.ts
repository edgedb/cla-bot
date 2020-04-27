

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
