import { CLA } from "../../domain/cla"
import { ClaRepository } from "../../domain/repositories";


class EdgeDBClaRepository implements ClaRepository {

  async getClaByGitHubUserId(githubUserId: Number): Promise<CLA | null> {
    // TODO
    return null;
  }

  async saveCla(data: CLA): Promise<void> {

  }
}

export { EdgeDBClaRepository };
