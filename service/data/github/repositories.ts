import fetch from "cross-fetch";
import { async_retry } from "../../../service/common/resiliency";
import {
  RepositoryInfo,
  RepositoriesService
} from "../../../service/domain/repositories";
import { expectSuccessfulResponse } from "../../../service/common/web";
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
    organization: string,
    pageNumber: number = 1
  ): Promise<RepositoryInfo[]> {
    const response = await fetch(
      `https://api.github.com/orgs/${organization}/repos?page=${pageNumber}`,
      {
        method: "GET"
      }
    )

    await expectSuccessfulResponse(response)
    const data: GitHubRepositoryInfo[] = await response.json()
    return data.map(item => new RepositoryInfo(
      item.id,
      item.name,
      item.full_name
    ))
  }

}
