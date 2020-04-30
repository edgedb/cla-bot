import { Cla, ClaRepository } from "../../domain/cla";
import { injectable } from "inversify";


@injectable()
class EdgeDBClaRepository implements ClaRepository {

  async getClaByGitHubUserId(githubUserId: Number): Promise<Cla | null> {
    // TODO
    return null;
  }

  async saveCla(data: Cla): Promise<void> {

  }
}

export { EdgeDBClaRepository };
