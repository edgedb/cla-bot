import { async_retry } from "../../../service/common/resiliency";
import { ExternalRepository, RepositoriesService } from "../../../service/domain/repositories";
import { fetchAllItems } from "./utils";
import { injectable } from "inversify";


interface GitHubRepositoryInfo {
  id: number
  name: string
  node_id: string
  full_name: string
  private: boolean
}


@injectable()
export class GitHubRepositoriesService implements RepositoriesService {

  @async_retry()
  async getRepositories(
    organization: string
  ): Promise<ExternalRepository[]> {

    const items = await fetchAllItems<GitHubRepositoryInfo>(
      `https://api.github.com/orgs/${organization}/repos`
    );

    return items
    .filter(item => item.private === false)
    .map(item => new ExternalRepository(
      item.id,
      item.name,
      item.full_name
    ))
  }

}
