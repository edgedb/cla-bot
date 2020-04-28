import { TYPES } from "../../constants/types"
import { injectable } from "inversify"
import { CLA, ClaRepository } from "../../domain/cla"


@injectable()
class EdgeDBClaRepository implements ClaRepository {

  async getClaByGitHubUserId(githubUserId: Number): Promise<CLA | null> {
    // TODO
    return null;
  }

  async saveCla(data: CLA): Promise<void> {

  }
}

export { EdgeDBClaRepository };
