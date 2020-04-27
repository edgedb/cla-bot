import { CLA } from "./cla"


export interface ClaRepository {

  getClaByGitHubUserId(githubUserId: Number): Promise<CLA | null>;

  saveCla(data: CLA): Promise<void>;
}
