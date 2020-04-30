import { Cla, ClaRepository } from "../../domain/cla";
import { injectable } from "inversify";


const CLAS: { [userId: number]: Cla; } = {};


@injectable()
class EdgeDBClaRepository implements ClaRepository {

  async getClaByGitHubUserId(githubUserId: number): Promise<Cla | null> {
    return CLAS[githubUserId] || null;
  }

  async saveCla(data: Cla): Promise<void> {
    CLAS[data.gitHubUserId] = data;
  }
}

export { EdgeDBClaRepository };
